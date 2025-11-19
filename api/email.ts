import { axiosBI } from '@/services/axios.bi';
import { CustomAxiosResponse } from '@/services/axios.bi';
import { ParsedMessage } from '@/types';

export interface GoogleApiEmailListResponse {
  messages: Array<{
    id: string;
    threadId: string;
  }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface GoogleApiEmailResponse {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: {
      data?: string;
      size?: number;
    };
    parts?: Array<{
      mimeType: string;
      body?: {
        data?: string;
        size?: number;
      };
      parts?: Array<{
        mimeType: string;
        body?: {
          data?: string;
          size?: number;
        };
      }>;
    }>;
  };
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

export interface GetEmailsParams {
  folder?: string;
  maxResults?: number;
  pageToken?: string;
  q?: string; // Search query
}

// Get list of email IDs from Google API
export const getEmailList = async (
  params?: GetEmailsParams
): Promise<CustomAxiosResponse<GoogleApiEmailListResponse>> => {
  const queryParams = new URLSearchParams();

  if (params?.folder) {
    queryParams.append('labelIds', params.folder);
  }
  if (params?.maxResults) {
    queryParams.append('maxResults', params.maxResults.toString());
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken);
  }
  if (params?.q) {
    queryParams.append('q', params.q);
  }

  return await axiosBI.get(`/gmail/messages?${queryParams.toString()}`);
};

// Get single email details from Google API
export const getEmail = async (
  emailId: string
): Promise<CustomAxiosResponse<GoogleApiEmailResponse>> => {
  return await axiosBI.get(`/gmail/messages/${emailId}`);
};

// Get multiple emails by IDs
export const getEmails = async (
  emailIds: string[]
): Promise<CustomAxiosResponse<GoogleApiEmailResponse[]>> => {
  return await axiosBI.post('/gmail/messages/batch', { ids: emailIds });
};

// Transform Google API response to ParsedMessage
export const transformGoogleEmailToParsedMessage = (
  googleEmail: GoogleApiEmailResponse
): ParsedMessage => {
  const headers = googleEmail.payload.headers.reduce(
    (acc, header) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    },
    {} as Record<string, string>
  );

  const getBody = (payload: GoogleApiEmailResponse['payload']): string => {
    if (payload.body?.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
        if (part.mimeType === 'text/html' && part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
        if (part.parts) {
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/plain' && subPart.body?.data) {
              return atob(
                subPart.body.data.replace(/-/g, '+').replace(/_/g, '/')
              );
            }
            if (subPart.mimeType === 'text/html' && subPart.body?.data) {
              return atob(
                subPart.body.data.replace(/-/g, '+').replace(/_/g, '/')
              );
            }
          }
        }
      }
    }
    return '';
  };

  const parseEmailAddress = (address: string) => {
    const match = address.match(/^(.+?)\s*<(.+?)>$|^(.+?)$/);
    if (match) {
      return {
        name: match[1] || match[3] || undefined,
        email: match[2] || match[3] || address,
      };
    }
    return { email: address };
  };

  const parseEmailAddresses = (addresses?: string) => {
    if (!addresses) return [];
    return addresses.split(',').map((addr) => parseEmailAddress(addr.trim()));
  };

  const body = getBody(googleEmail.payload);
  const processedHtml = body.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  return {
    id: googleEmail.id,
    threadId: googleEmail.threadId,
    title: headers.subject || '(No Subject)',
    subject: headers.subject || '',
    tags: googleEmail.labelIds.map((labelId, index) => ({
      id: labelId,
      name: labelId,
      type: 'user',
    })),
    sender: parseEmailAddress(headers.from || ''),
    to: parseEmailAddresses(headers.to),
    cc: headers.cc ? parseEmailAddresses(headers.cc) : null,
    bcc: headers.bcc ? parseEmailAddresses(headers.bcc) : null,
    tls: true,
    receivedOn: new Date(parseInt(googleEmail.internalDate)).toISOString(),
    unread: !googleEmail.labelIds.includes('READ'),
    body: body.replace(/<[^>]*>/g, '').trim(),
    processedHtml,
    blobUrl: '',
    messageId: headers['message-id'],
    inReplyTo: headers['in-reply-to'],
    references: headers.references,
    replyTo: headers['reply-to'],
    isDraft: googleEmail.labelIds.includes('DRAFT'),
    attachments: [],
  };
};

// Get emails with transformation
export const getParsedEmails = async (
  params?: GetEmailsParams
): Promise<
  CustomAxiosResponse<{ emails: ParsedMessage[]; nextPageToken?: string }>
> => {
  const listResponse = await getEmailList(params);
  const messageIds = listResponse.data.messages?.map((msg) => msg.id) || [];

  if (messageIds.length === 0) {
    return {
      ...listResponse,
      data: {
        emails: [],
        nextPageToken: listResponse.data.nextPageToken,
      },
    };
  }

  const emailsResponse = await getEmails(messageIds);
  const emails = emailsResponse.data.map(transformGoogleEmailToParsedMessage);

  return {
    ...emailsResponse,
    data: {
      emails,
      nextPageToken: listResponse.data.nextPageToken,
    },
  };
};
