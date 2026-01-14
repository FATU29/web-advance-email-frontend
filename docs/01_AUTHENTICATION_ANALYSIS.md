# PHÂN TÍCH CHI TIẾT: HỆ THỐNG XÁC THỰC VÀ QUẢN LÝ TOKEN

## 1. TỔNG QUAN HỆ THỐNG XÁC THỰC

Dự án Email Client triển khai một hệ thống xác thực đa lớp, kết hợp nhiều phương thức đăng nhập và cơ chế bảo mật tiên tiến. Hệ thống được thiết kế để đảm bảo tính bảo mật cao nhất trong khi vẫn duy trì trải nghiệm người dùng mượt mà.

### 1.1. Các Phương Thức Xác Thực Được Hỗ Trợ

Hệ thống hỗ trợ **hai phương thức đăng nhập chính**:

#### A. Đăng Nhập Truyền Thống (Email & Password)

Phương thức này cho phép người dùng tạo tài khoản riêng trong hệ thống với email và mật khẩu. Quy trình bao gồm:

- **Đăng ký tài khoản**: Người dùng cung cấp thông tin (tên, email, mật khẩu)
- **Xác thực email bằng OTP**: Hệ thống gửi mã OTP đến email để xác nhận tính hợp lệ
- **Mã hóa mật khẩu**: Mật khẩu được hash bằng BCrypt trước khi lưu vào database
- **Đăng nhập**: Xác thực credentials và cấp phát JWT tokens

#### B. Đăng Nhập Google OAuth 2.0

Phương thức này tích hợp với Google OAuth 2.0, cho phép người dùng đăng nhập bằng tài khoản Google và tự động kết nối với Gmail API. Đây là phương thức **được khuyến nghị** vì:

- **Không cần tạo mật khẩu mới**: Sử dụng credentials Google hiện có
- **Tích hợp tự động với Gmail**: Sau khi đăng nhập, hệ thống có quyền truy cập Gmail API
- **Bảo mật cao hơn**: Tận dụng cơ chế bảo mật của Google
- **Trải nghiệm người dùng tốt hơn**: Đăng nhập một chạm (Single Sign-On)

### 1.2. Kiến Trúc Xác Thực Tổng Thể

Hệ thống xác thực được xây dựng theo mô hình **Layered Architecture** với các tầng sau:

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Controller)       │
│   - AuthController                      │
│   - Xử lý HTTP requests/responses       │
│   - Validation đầu vào                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Business Logic Layer (Service)        │
│   - AuthService                         │
│   - Logic đăng nhập, đăng ký, refresh   │
│   - Tích hợp với Google OAuth           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Security Layer                        │
│   - JwtTokenProvider                    │
│   - Token generation & validation       │
│   - SecurityConfig (JWT filter)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Data Access Layer (Repository)        │
│   - UserRepository                      │
│   - RefreshTokenRepository              │
│   - Lưu trữ users và tokens             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Database (MongoDB)                    │
│   - users collection                    │
│   - refresh_tokens collection           │
│   - google_tokens collection            │
└─────────────────────────────────────────┘
```

---

## 2. GOOGLE OAUTH 2.0 AUTHORIZATION CODE FLOW

### 2.1. Tại Sao Sử Dụng Authorization Code Flow?

Dự án sử dụng **Authorization Code Flow** thay vì Implicit Flow vì nhiều lý do bảo mật:

#### Ưu Điểm Của Authorization Code Flow:

1. **Authorization code chỉ sử dụng một lần**: Code được đổi thành tokens trên server, không thể tái sử dụng
2. **Refresh token được bảo vệ**: Refresh token không bao giờ gửi đến frontend (client)
3. **Client Secret được bảo mật**: Secret chỉ tồn tại trên backend server
4. **Tokens không lộ trên URL**: Không như Implicit Flow, tokens không xuất hiện trên URL (browser history)

#### Nhược Điểm Của Implicit Flow (Đã Bị Loại Bỏ):

- Tokens xuất hiện trên URL, có thể bị log hoặc leak
- Không có refresh token mechanism
- Kém bảo mật hơn cho ứng dụng web hiện đại

### 2.2. Quy Trình Chi Tiết Google OAuth Login

#### **Bước 1: Frontend Khởi Tạo OAuth Flow**

Frontend sử dụng Google OAuth library để mở popup/redirect đến Google:

```
User clicks "Sign in with Google"
         ↓
Frontend: Redirect to Google OAuth consent screen
URL: https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID
     &redirect_uri=http://localhost:3000/auth/callback
     &response_type=code
     &scope=openid email profile gmail.readonly gmail.modify
     &access_type=offline
     &prompt=consent
```

**Giải thích các parameters:**

- `client_id`: ID của ứng dụng đăng ký trên Google Cloud Console
- `redirect_uri`: URL mà Google sẽ redirect về sau khi user cho phép
- `response_type=code`: Yêu cầu trả về authorization code (không phải access token)
- `scope`: Các quyền yêu cầu (email, profile, Gmail read/modify)
- `access_type=offline`: Yêu cầu refresh token để truy cập lâu dài
- `prompt=consent`: Luôn hiển thị màn hình consent để user xác nhận quyền

#### **Bước 2: User Cấp Quyền Trên Google**

Người dùng thấy màn hình consent của Google liệt kê các quyền:

- Xem thông tin cơ bản (email, tên, ảnh)
- Đọc emails trong Gmail
- Gửi và chỉnh sửa emails

Sau khi user nhấn "Allow", Google redirect về `redirect_uri` với authorization code:

```
http://localhost:3000/auth/callback?code=4/0AY0e-g7...&scope=openid+email+profile...
```

#### **Bước 3: Frontend Gửi Authorization Code Đến Backend**

Frontend nhận code từ URL và gửi đến backend API:

```
POST /api/auth/google
Content-Type: application/json

{
  "code": "4/0AY0e-g7..."
}
```

**Endpoint xử lý trên Backend:**

```java
@PostMapping("/google")
public ResponseEntity<ApiResponse<AuthResponse>> googleAuthCodeLogin(
        @Valid @RequestBody GoogleAuthCodeRequest request,
        HttpServletResponse response) {

    AuthResponse authResponse = authService.googleAuthCodeLogin(request);

    // Set refresh token in HttpOnly cookie
    setRefreshTokenCookie(response, authResponse.getRefreshToken());

    // Remove refresh token from response body
    authResponse.setRefreshToken(null);

    return ResponseEntity.ok(ApiResponse.success(
        "Google authentication successful", authResponse));
}
```

#### **Bước 4: Backend Đổi Code Thành Tokens**

Backend sử dụng **Google OAuth Library** để đổi authorization code thành tokens:

```java
GoogleAuthorizationCodeTokenRequest tokenRequest =
    new GoogleAuthorizationCodeTokenRequest(
        new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        "https://oauth2.googleapis.com/token",
        clientId,
        clientSecret,
        code,
        redirectUri
    );

GoogleTokenResponse tokenResponse = tokenRequest.execute();
```

**Response từ Google chứa:**

- `access_token`: Token ngắn hạn (1 giờ) để gọi Gmail API
- `refresh_token`: Token dài hạn để refresh access token (chỉ có khi `access_type=offline`)
- `expires_in`: Thời gian hết hạn access token (3600 giây)
- `id_token`: JWT chứa thông tin user (email, name, picture)

#### **Bước 5: Xác Thực ID Token Và Lấy Thông Tin User**

Backend verify ID token để lấy thông tin user:

```java
GoogleIdToken idToken = GoogleIdToken.parse(
    GsonFactory.getDefaultInstance(),
    tokenResponse.getIdToken()
);

GoogleIdToken.Payload payload = idToken.getPayload();

String googleId = payload.getSubject();
String email = payload.getEmail();
String name = (String) payload.get("name");
String picture = (String) payload.get("picture");
Boolean emailVerified = payload.getEmailVerified();
```

**Validation quan trọng:**

- Kiểm tra `emailVerified = true` để đảm bảo email đã được Google xác thực
- Verify `aud` (audience) trong ID token khớp với client ID của app
- Kiểm tra `iss` (issuer) là `accounts.google.com` hoặc `https://accounts.google.com`

#### **Bước 6: Tạo Hoặc Cập Nhật User Trong Database**

Backend kiểm tra xem user đã tồn tại chưa (dựa vào `googleId` hoặc `email`):

```java
User user = userRepository.findByGoogleId(googleId)
    .or(() -> userRepository.findByEmail(email))
    .map(existingUser -> {
        // Cập nhật thông tin user nếu đã tồn tại
        existingUser.setGoogleId(googleId);
        existingUser.setName(name);
        existingUser.setProfilePicture(picture);
        existingUser.setEmailVerified(emailVerified);
        existingUser.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(existingUser);
    })
    .orElseGet(() -> {
        // Tạo user mới nếu chưa tồn tại
        User newUser = User.builder()
            .googleId(googleId)
            .email(email)
            .name(name)
            .profilePicture(picture)
            .emailVerified(emailVerified)
            .password(null) // Google OAuth users không có password
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return userRepository.save(newUser);
    });
```

#### **Bước 7: Lưu Gmail Tokens Vào Database**

Backend lưu access token và refresh token của Gmail để sử dụng sau này:

```java
gmailService.storeTokensFromResponse(user.getId(), tokenResponse);

// Mark user as Gmail connected
user.setGmailConnected(true);
userRepository.save(user);
```

**Lưu vào `google_tokens` collection:**

```json
{
  "_id": "token_id",
  "userId": "user_id",
  "accessToken": "ya29.a0AfH6SMB...",
  "refreshToken": "1//0gH...",
  "accessTokenExpiresAt": "2026-01-14T15:30:00",
  "scope": "openid email profile https://www.googleapis.com/auth/gmail.readonly...",
  "createdAt": "2026-01-14T14:30:00",
  "updatedAt": "2026-01-14T14:30:00"
}
```

**Lý do quan trọng phải lưu:**

- **Access Token**: Dùng để gọi Gmail API (expires sau 1 giờ)
- **Refresh Token**: Dùng để refresh access token khi hết hạn (long-lived, không expire trừ khi user revoke)
- **ExpiresAt**: Để biết khi nào cần refresh access token

#### **Bước 8: Generate JWT Tokens Cho Ứng Dụng**

Backend tạo JWT access token và refresh token riêng của ứng dụng (không phải của Google):

```java
private AuthResponse generateAuthResponse(User user) {
    // Generate access token (ngắn hạn - 1 giờ)
    String accessToken = tokenProvider.generateAccessToken(
        user.getId(),
        user.getEmail(),
        user.getName(),
        user.getProfilePicture()
    );

    // Generate refresh token (dài hạn - 7 ngày)
    String refreshTokenStr = tokenProvider.generateRefreshToken(user.getId());

    // Hash refresh token trước khi lưu database
    String tokenHash = TokenHashUtil.hashToken(refreshTokenStr);

    RefreshToken refreshToken = RefreshToken.builder()
        .tokenHash(tokenHash)
        .userId(user.getId())
        .expiryDate(LocalDateTime.now().plusSeconds(
            tokenProvider.getRefreshTokenExpirationMs() / 1000))
        .createdAt(LocalDateTime.now())
        .revoked(false)
        .build();

    refreshTokenRepository.save(refreshToken);

    return AuthResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshTokenStr) // Plain token gửi cho client
        .tokenType("Bearer")
        .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
        .user(AuthResponse.UserInfo.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .profilePicture(user.getProfilePicture())
            .build())
        .build();
}
```

#### **Bước 9: Trả Về Tokens Cho Frontend (Với HttpOnly Cookie)**

Backend set refresh token vào **HttpOnly Cookie** và chỉ trả access token trong response body:

```java
private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
    Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
    cookie.setHttpOnly(true);  // Không thể access từ JavaScript
    cookie.setSecure(cookieSecure);  // Chỉ gửi qua HTTPS
    cookie.setPath("/");  // Available cho tất cả routes
    cookie.setMaxAge(7 * 24 * 60 * 60);  // 7 days
    cookie.setAttribute("SameSite", cookieSameSite);  // CSRF protection
    response.addCookie(cookie);
}
```

**Response trả về frontend:**

```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": null, // Không trả về (đã set trong cookie)
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "user_id",
      "email": "user@gmail.com",
      "name": "John Doe",
      "profilePicture": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

#### **Bước 10: Frontend Lưu Access Token Và Redirect**

Frontend lưu access token vào localStorage và redirect đến dashboard:

```typescript
const { data } = await AuthService.googleSignIn({ code: authCode });

if (data.success && data.data) {
  // Lưu access token vào localStorage
  setAccessToken(data.data.accessToken);

  // Refresh token đã tự động được set trong HttpOnly cookie
  // Frontend KHÔNG CẦN và KHÔNG THỂ access refresh token

  // Redirect to dashboard
  router.push('/mail/kanban');
}
```

---

## 3. JWT TOKEN MANAGEMENT STRATEGY

### 3.1. Dual-Token System

Hệ thống sử dụng **hai loại tokens** với mục đích và thời gian sống khác nhau:

#### A. Access Token

**Đặc điểm:**

- **Thời gian sống ngắn**: 1 giờ (3600 giây)
- **Lưu trữ**: localStorage trên frontend
- **Mục đích**: Xác thực các API requests hàng ngày
- **Nội dung**: Chứa thông tin user (id, email, name, profilePicture)

**Cấu trúc Access Token:**

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user_id",
  "user": {
    "id": "user_id",
    "email": "user@gmail.com",
    "name": "John Doe",
    "profilePicture": "https://..."
  },
  "type": "access",
  "iat": 1705238400,
  "exp": 1705242000
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Lý do thời gian sống ngắn:**

- Giảm thiểu rủi ro nếu token bị steal (XSS attack)
- Nếu access token bị lộ, attacker chỉ có 1 giờ để exploit
- Giảm tải cho server (không cần check revocation liên tục)

#### B. Refresh Token

**Đặc điểm:**

- **Thời gian sống dài**: 7 ngày (604800 giây)
- **Lưu trữ**: HttpOnly Cookie (không thể access từ JavaScript)
- **Mục đích**: Refresh access token khi hết hạn
- **Bảo mật**: Token được hash (SHA-256) trước khi lưu database

**Cấu trúc Refresh Token:**

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user_id",
  "type": "refresh",
  "iat": 1705238400,
  "exp": 1705843200
}
```

**Tại sao lưu trong HttpOnly Cookie:**

- **Bảo vệ khỏi XSS**: JavaScript không thể đọc được cookie HttpOnly
- **Tự động gửi**: Browser tự động attach cookie vào mọi request
- **CSRF protection**: Kết hợp với SameSite=Strict/Lax attribute

### 3.2. Token Hashing Mechanism

**Vấn đề**: Nếu database bị breach, attacker có thể lấy refresh tokens và giả mạo users.

**Giải pháp**: Hash refresh token trước khi lưu database.

#### Token Hashing Implementation:

```java
public class TokenHashUtil {
    public static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
```

**Quy trình:**

1. User đăng nhập → Backend tạo refresh token (plain text JWT)
2. Backend hash token bằng SHA-256
3. Lưu **hash** vào database, gửi **plain token** cho client (via HttpOnly cookie)
4. Client gửi refresh request → Browser tự động gửi plain token trong cookie
5. Backend hash token nhận được và so sánh với hash trong database

**Lợi ích:**

- Database breach không lộ plain tokens
- Attacker không thể reverse hash để lấy original token
- Vẫn có thể verify tokens bằng cách hash và so sánh

### 3.3. Token Refresh Flow

**Kịch bản**: Access token hết hạn sau 1 giờ, user vẫn đang sử dụng app.

#### Quy Trình Auto-Refresh:

**Bước 1: Frontend Gửi Request Với Expired Access Token**

```
GET /api/emails
Authorization: Bearer <expired_access_token>
```

**Bước 2: Backend Trả Về 401 Unauthorized**

JWT Filter trên backend detect token expired và trả về:

```json
{
  "success": false,
  "message": "JWT token has expired",
  "timestamp": "2026-01-14T15:30:00"
}
```

**Bước 3: Frontend Axios Interceptor Bắt 401 Error**

Axios response interceptor tự động detect 401 và trigger refresh:

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Check if error is 401 and not from refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest?.url?.includes('/auth/refresh')
    ) {
      // Prevent multiple refresh requests
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Call refresh endpoint (cookie sent automatically)
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            // Update token in storage
            setAccessToken(newAccessToken);

            // Update Authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Process queued requests
            processQueue(null, newAccessToken);

            // Retry original request
            return instance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Queue requests while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return instance(originalRequest);
      });
    }

    return Promise.reject(error);
  }
);
```

**Bước 4: Frontend Gọi Refresh Endpoint**

```typescript
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // CRITICAL: Send HttpOnly cookie
  });

  // No body needed - browser sends refresh token cookie automatically
  const response =
    await refreshAxios.post<RefreshTokenResponse>('/api/auth/refresh');

  if (response.data.success && response.data.data) {
    return response.data.data.accessToken;
  }

  return null;
};
```

**Bước 5: Backend Xử Lý Refresh Request**

```java
@PostMapping("/refresh")
public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
        HttpServletRequest request,
        HttpServletResponse response) {

    // Get refresh token from HttpOnly cookie
    String refreshToken = getRefreshTokenFromCookie(request);

    if (refreshToken == null) {
        return ResponseEntity.status(401)
            .body(ApiResponse.error("No refresh token provided"));
    }

    // Refresh token and generate new access token
    AuthResponse authResponse = authService.refreshToken(refreshToken);

    // Keep same refresh token (no rotation for now)
    authResponse.setRefreshToken(null);

    return ResponseEntity.ok(ApiResponse.success(
        "Token refreshed successfully", authResponse));
}
```

**Backend Service Logic:**

```java
public AuthResponse refreshToken(String refreshTokenStr) {
    // Hash the incoming token
    String tokenHash = TokenHashUtil.hashToken(refreshTokenStr);

    // Find refresh token by hash
    RefreshToken refreshToken = refreshTokenRepository
        .findByTokenHash(tokenHash)
        .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

    // Check if revoked
    if (refreshToken.isRevoked()) {
        throw new UnauthorizedException("Refresh token has been revoked");
    }

    // Check if expired
    if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
        refreshTokenRepository.delete(refreshToken);
        throw new UnauthorizedException("Refresh token has expired");
    }

    // Get user
    User user = userRepository.findById(refreshToken.getUserId())
        .orElseThrow(() -> new UnauthorizedException("User not found"));

    // Generate new access token
    String accessToken = tokenProvider.generateAccessToken(
        user.getId(), user.getEmail(), user.getName(), user.getProfilePicture()
    );

    return AuthResponse.builder()
        .accessToken(accessToken)
        .tokenType("Bearer")
        .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
        .user(...)
        .build();
}
```

**Bước 6: Frontend Nhận Access Token Mới Và Retry Request**

Frontend lưu access token mới và retry request gốc:

```typescript
// Lưu access token mới
setAccessToken(newAccessToken);

// Retry original request với token mới
originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
return axios(originalRequest);
```

### 3.4. Concurrency Handling - Xử Lý Nhiều 401 Cùng Lúc

**Vấn đề**: Nếu nhiều API requests cùng lúc nhận 401 (vì access token expired), có thể có nhiều refresh requests gửi đồng thời.

**Giải pháp**: Sử dụng **request queueing** với flag `isRefreshing`.

#### Cơ Chế Request Queue:

```typescript
let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};
```

**Luồng xử lý:**

1. **Request đầu tiên nhận 401**:
   - Set `isRefreshing = true`
   - Gọi refresh endpoint
   - Các requests khác phải đợi

2. **Các requests tiếp theo nhận 401 (trong khi đang refresh)**:
   - Không gọi refresh endpoint
   - Thêm vào `failedQueue`
   - Đợi request đầu tiên hoàn thành

3. **Khi refresh thành công**:
   - `processQueue(null, newAccessToken)` được gọi
   - Tất cả requests trong queue nhận access token mới
   - Retry với token mới

4. **Khi refresh thất bại**:
   - `processQueue(error, null)` được gọi
   - Tất cả requests trong queue bị reject
   - Redirect to login

**Lợi ích:**

- Chỉ có **một** refresh request tại một thời điểm
- Tránh race conditions
- Tiết kiệm bandwidth và server resources
- User experience tốt hơn (không bị multiple login redirects)

---

## 4. LOGOUT VÀ TOKEN REVOCATION

### 4.1. Logout Flow

**Mục tiêu**: Xóa tất cả tokens và đảm bảo user không thể tiếp tục access với token cũ.

#### Quy Trình Logout Chi Tiết:

**Bước 1: User Clicks Logout Button**

```typescript
const handleLogout = async () => {
  try {
    await AuthService.logout();

    // Clear access token from localStorage
    removeTokens();

    // Redirect to login
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

**Bước 2: Frontend Gửi Logout Request**

```
POST /api/auth/logout
Authorization: Bearer <access_token>
Cookie: refreshToken=<refresh_token>
```

**Bước 3: Backend Revoke Refresh Token**

```java
@PostMapping("/logout")
public ResponseEntity<ApiResponse<Void>> logout(
        Authentication authentication,
        HttpServletRequest request,
        HttpServletResponse response) {

    String userId = (String) authentication.getPrincipal();

    // Get refresh token from cookie
    String refreshToken = getRefreshTokenFromCookie(request);

    // Revoke refresh token in database
    authService.logout(userId, refreshToken);

    // Clear the refresh token cookie
    clearRefreshTokenCookie(response);

    return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
}
```

**Service Logic:**

```java
@Transactional
public void logout(String userId, String refreshTokenStr) {
    if (refreshTokenStr != null) {
        // Hash token before lookup
        String tokenHash = TokenHashUtil.hashToken(refreshTokenStr);

        // Delete specific refresh token
        refreshTokenRepository.deleteByTokenHash(tokenHash);
    } else {
        // Fallback: Delete all refresh tokens for user
        refreshTokenRepository.deleteByUserId(userId);
    }
}
```

**Bước 4: Clear HttpOnly Cookie**

```java
private void clearRefreshTokenCookie(HttpServletResponse response) {
    Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, null);
    cookie.setHttpOnly(true);
    cookie.setSecure(cookieSecure);
    cookie.setPath("/");
    cookie.setMaxAge(0);  // Expire immediately
    response.addCookie(cookie);
}
```

**Bước 5: Frontend Clear Access Token Và Redirect**

```typescript
// Clear access token from localStorage
removeAccessToken();

// Redirect to login page
window.location.href = '/login';
```

### 4.2. Forced Logout On Invalid Refresh Token

**Kịch bản**: Refresh token hết hạn hoặc bị revoke (user logout từ device khác).

#### Auto-Logout Logic:

```typescript
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await refreshAxios.post('/api/auth/refresh');

    if (response.data.success && response.data.data) {
      return response.data.data.accessToken;
    }

    return null;
  } catch (error) {
    const axiosError = error as AxiosError;

    // Refresh token expired or invalid (401)
    if (axiosError.response?.status === 401) {
      console.warn('Refresh token expired. Redirecting to login...');

      // Force logout
      redirectToLogin();
    }

    return null;
  }
};

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    removeTokens();
    window.location.href = '/login';
  }
};
```

**Backend trả về 401 khi:**

- Refresh token không tồn tại trong database
- Refresh token đã bị revoke (`revoked = true`)
- Refresh token đã hết hạn (`expiryDate < now`)
- Token hash không khớp (invalid token)

---

## 5. SECURITY CONSIDERATIONS

### 5.1. Token Storage Security

#### Bảng So Sánh Các Phương Pháp Lưu Trữ Token:

| Phương Pháp           | Access Token | Refresh Token | Ưu Điểm                                                                   | Nhược Điểm                                            |
| --------------------- | ------------ | ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| **localStorage**      | ✅ Có        | ❌ Không      | - Dễ implement<br>- Persist qua page reload<br>- Không bị mất khi refresh | - Dễ bị XSS attack<br>- Accessible từ JS              |
| **sessionStorage**    | ⚠️ Có thể    | ❌ Không      | - Tự động clear khi đóng tab<br>- Phạm vi nhỏ hơn                         | - Mất khi refresh page<br>- Vẫn dễ bị XSS             |
| **Memory (variable)** | ⚠️ Có thể    | ❌ Không      | - An toàn nhất với XSS<br>- Không persist anywhere                        | - Mất khi refresh page<br>- UX kém                    |
| **HttpOnly Cookie**   | ❌ Không     | ✅ Có         | - **Bảo vệ khỏi XSS**<br>- Auto gửi với requests<br>- Server-side control | - Vulnerable to CSRF (cần SameSite)<br>- Phức tạp hơn |

#### Lựa Chọn Của Dự Án:

**Access Token**: localStorage

- Thời gian sống ngắn (1 giờ) → rủi ro thấp nếu bị steal
- User experience tốt (không bị logout khi refresh page)
- Trade-off giữa security và usability

**Refresh Token**: HttpOnly Cookie

- Bảo vệ khỏi XSS attacks (JavaScript không thể đọc)
- Thời gian sống dài (7 ngày) → cần bảo mật cao
- Kết hợp SameSite attribute để chống CSRF

### 5.2. CSRF Protection

**Cross-Site Request Forgery (CSRF)**: Attacker lừa browser gửi request với cookies của victim.

#### Cách Phòng Chống:

**1. SameSite Cookie Attribute**

```java
cookie.setAttribute("SameSite", "None");  // Hoặc "Strict"/"Lax"
```

**Giải thích các giá trị:**

- **Strict**: Cookie chỉ gửi khi request từ cùng site (bảo mật cao nhất)
- **Lax**: Cookie gửi khi navigate từ external site (GET request)
- **None**: Cookie gửi với mọi request (cần `Secure=true` - chỉ HTTPS)

**Lựa chọn dự án**: `None` (để support cross-origin trong development)

**2. Secure Flag**

```java
cookie.setSecure(true);  // Chỉ gửi qua HTTPS
```

Đảm bảo cookie không bị leak qua HTTP (man-in-the-middle attacks).

**3. CORS Configuration**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")  // Frontend URL
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowCredentials(true);  // Allow cookies
    }
}
```

**4. Frontend: withCredentials**

```typescript
const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Send cookies with requests
});
```

### 5.3. XSS Protection

**Cross-Site Scripting (XSS)**: Attacker inject malicious JS vào website.

#### Cách Phòng Chống:

**1. HttpOnly Cookie Cho Refresh Token**

- Refresh token không thể đọc từ JavaScript
- Ngay cả khi XSS xảy ra, attacker không lấy được refresh token

**2. Input Sanitization**

- Validate và sanitize mọi user input
- Không render raw HTML từ user input

**3. Content Security Policy (CSP)**

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';
```

**4. Short-Lived Access Token**

- Access token hết hạn sau 1 giờ
- Nếu bị steal, attacker chỉ có thời gian ngắn để exploit

### 5.4. Token Hash In Database

**Vấn đề**: Database breach có thể lộ refresh tokens.

**Giải pháp**: Hash tokens trước khi lưu.

```java
// When saving token
String tokenHash = TokenHashUtil.hashToken(refreshToken);
refreshTokenRepository.save(
    RefreshToken.builder()
        .tokenHash(tokenHash)  // Lưu hash, không phải plain token
        .userId(userId)
        .build()
);

// When validating token
String receivedTokenHash = TokenHashUtil.hashToken(receivedToken);
RefreshToken token = refreshTokenRepository.findByTokenHash(receivedTokenHash);
```

**Lợi ích:**

- Attacker không thể dùng hash để authenticate (hash không thể reverse)
- Tokens bị leak từ database không thể sử dụng trực tiếp
- Defense-in-depth strategy

---

## 6. FRONTEND AUTH STATE MANAGEMENT

### 6.1. Zustand Store For Auth

Frontend sử dụng **Zustand** để quản lý auth state globally.

#### Store Structure:

```typescript
interface AuthState {
  user: IAuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: IAuthUser) => void;
  setAccessToken: (token: string) => void;
  login: (user: IAuthUser, accessToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}
```

#### Implementation (Giả định):

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  setAccessToken as setTokenInStorage,
  removeTokens,
} from '@/services/jwt';

const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setAccessToken: (token) => {
        setTokenInStorage(token);
        set({ accessToken: token });
      },

      login: (user, accessToken) => {
        setTokenInStorage(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
        }

        removeTokens();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = getAccessToken();

        if (!token) {
          return false;
        }

        try {
          const response = await AuthService.getCurrentUser();

          if (response.data.success && response.data.data) {
            set({
              user: response.data.data,
              accessToken: token,
              isAuthenticated: true,
            });
            return true;
          }
        } catch (error) {
          removeTokens();
          set({ user: null, accessToken: null, isAuthenticated: false });
        }

        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Chỉ persist user info
    }
  )
);
```

### 6.2. Protected Routes

**Mục đích**: Chỉ cho phép authenticated users truy cập một số routes.

#### Route Guard Implementation:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/services/jwt';

const publicRoutes = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check access token (trong thực tế, có thể cần verify token)
  const accessToken = getAccessToken();

  if (!accessToken) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mail/:path*', '/settings/:path*', '/profile/:path*'],
};
```

### 6.3. Auth Context Provider (Optional)

Ngoài Zustand, có thể dùng React Context để wrap toàn bộ app:

```typescript
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: IAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: IAuthUser, accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (user: IAuthUser, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    removeTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
```

---

## 7. ERROR HANDLING VÀ EDGE CASES

### 7.1. Các Lỗi Phổ Biến Và Xử Lý

#### A. Authorization Code Đã Được Sử Dụng

**Nguyên nhân**: Authorization code chỉ sử dụng được **một lần**. Nếu frontend gửi lại code, Google sẽ trả lỗi.

**Lỗi từ Google:**

```json
{
  "error": "invalid_grant",
  "error_description": "Bad Request"
}
```

**Cách khắc phục:**

- Lưu tokenResponse sau lần exchange đầu tiên
- Sử dụng `gmailService.storeTokensFromResponse()` thay vì `exchangeCodeForTokens()`
- Đảm bảo frontend chỉ gửi code một lần

#### B. Refresh Token Không Được Cấp

**Nguyên nhân**: Google chỉ cấp refresh token khi:

- `access_type=offline`
- `prompt=consent` (hoặc user chưa grant permissions trước đó)

**Kiểm tra:**

```java
if (tokenResponse.getRefreshToken() == null) {
    throw new UnauthorizedException(
        "No refresh token received. User may need to re-authorize with prompt=consent"
    );
}
```

**Giải pháp:**

- Thêm `prompt=consent` vào OAuth URL
- Hoặc user cần revoke app trong Google Account settings và authorize lại

#### C. Access Token Hết Hạn Quá Nhanh

**Triệu chứng**: User bị logout liên tục.

**Nguyên nhân:**

- Access token hết hạn (1 giờ)
- Refresh token cũng hết hạn hoặc bị revoke

**Debug:**

```typescript
// Check token expiration
const token = getAccessToken();
if (token) {
  const decoded = decodeJwt(token);
  const expiresAt = new Date(decoded.exp * 1000);
  console.log('Token expires at:', expiresAt);
  console.log(
    'Time remaining:',
    (decoded.exp * 1000 - Date.now()) / 1000,
    'seconds'
  );
}
```

**Giải pháp:**

- Đảm bảo refresh logic hoạt động đúng
- Check `isRefreshing` flag để tránh multiple refresh requests
- Verify refresh token chưa hết hạn trong database

#### D. CORS Errors Khi Gửi Cookie

**Lỗi:**

```
Access to XMLHttpRequest has been blocked by CORS policy:
The value of the 'Access-Control-Allow-Credentials' header in the response is ''
which must be 'true' when the request's credentials mode is 'include'.
```

**Nguyên nhân**: Backend không cho phép credentials trong CORS config.

**Giải pháp:**

Backend:

```java
.allowCredentials(true)
```

Frontend:

```typescript
withCredentials: true;
```

#### E. SameSite Cookie Warning

**Warning trong Chrome DevTools:**

```
A cookie associated with a cross-site resource was set without the `SameSite` attribute.
```

**Giải pháp:**

```java
cookie.setAttribute("SameSite", "None");
cookie.setSecure(true);  // Required when SameSite=None
```

### 7.2. Testing Authentication Flow

#### Test Cases Quan Trọng:

**1. Successful Google OAuth Login**

```
Given: User clicks "Sign in with Google"
When: User authorizes app on Google
Then: User is redirected to dashboard with valid tokens
```

**2. Token Refresh On 401**

```
Given: Access token is expired
When: User makes an API request
Then: Access token is automatically refreshed
And: Original request is retried successfully
```

**3. Logout Clears All Tokens**

```
Given: User is logged in
When: User clicks logout
Then: Access token is removed from localStorage
And: Refresh token cookie is cleared
And: User is redirected to login page
```

**4. Invalid Refresh Token Forces Logout**

```
Given: Refresh token is expired or revoked
When: System tries to refresh access token
Then: User is automatically logged out
And: Redirected to login page
```

**5. Concurrent 401 Errors**

```
Given: Access token is expired
When: Multiple API requests receive 401 simultaneously
Then: Only one refresh request is made
And: All requests are queued and retried after refresh
```

---

## 8. KẾT LUẬN VÀ BEST PRACTICES

### 8.1. Tóm Tắt Kiến Trúc Authentication

Hệ thống xác thực của dự án được thiết kế với các đặc điểm nổi bật:

1. **Dual-Token System**: Access token (1h) + Refresh token (7d)
2. **HttpOnly Cookie**: Refresh token được bảo vệ khỏi XSS
3. **Token Hashing**: Refresh tokens được hash trước khi lưu database
4. **Auto-Refresh**: Tự động refresh access token khi hết hạn
5. **Google OAuth 2.0**: Tích hợp sâu với Gmail API
6. **Authorization Code Flow**: Bảo mật hơn Implicit Flow
7. **Concurrency Handling**: Chỉ một refresh request tại một thời điểm

### 8.2. Security Best Practices Đã Áp Dụng

✅ **Token Storage**

- Access token: localStorage (short-lived, acceptable risk)
- Refresh token: HttpOnly cookie (protected from XSS)

✅ **CSRF Protection**

- SameSite cookie attribute
- CORS configuration with credentials
- Secure flag for HTTPS-only transmission

✅ **Token Hashing**

- SHA-256 hashing cho refresh tokens
- Database breach không lộ plain tokens

✅ **Auto-Logout**

- Forced logout khi refresh token invalid/expired
- Clear tất cả tokens on logout

✅ **Concurrency Control**

- Request queueing during token refresh
- Prevent multiple simultaneous refresh requests

### 8.3. Recommendations Cho Development

**1. Monitoring & Logging**

- Log mọi authentication events (login, logout, refresh)
- Monitor failed refresh attempts (possible attack)
- Track token expiration và refresh rates

**2. Token Rotation**

- Implement refresh token rotation (issue new refresh token on each refresh)
- Detect refresh token reuse (possible token theft)

**3. Rate Limiting**

- Limit login attempts (prevent brute force)
- Limit refresh requests per user

**4. Token Revocation List**

- Implement blacklist cho revoked access tokens (optional)
- Auto-cleanup expired tokens từ database

**5. Multi-Device Support**

- Allow multiple refresh tokens per user (different devices)
- Provide "logout all devices" functionality

### 8.4. Future Improvements

**1. Refresh Token Rotation**

```java
// Issue new refresh token on every refresh
String newRefreshToken = tokenProvider.generateRefreshToken(userId);
setRefreshTokenCookie(response, newRefreshToken);
```

**2. Device Fingerprinting**

```java
// Bind refresh token to device fingerprint
RefreshToken.builder()
    .tokenHash(tokenHash)
    .userId(userId)
    .deviceFingerprint(getDeviceFingerprint(request))
    .build();
```

**3. Passwordless Authentication**

- Magic link login
- Biometric authentication (WebAuthn)

**4. Multi-Factor Authentication (MFA)**

- TOTP (Time-based One-Time Password)
- SMS verification
- Backup codes

---

**Tài liệu này mô tả chi tiết cơ chế xác thực và quản lý token của dự án Email Client, bao gồm Google OAuth 2.0 integration, JWT token management, security considerations, và best practices. Hệ thống được thiết kế để cân bằng giữa bảo mật và user experience, với các cơ chế tự động refresh token và xử lý concurrency hiệu quả.**
