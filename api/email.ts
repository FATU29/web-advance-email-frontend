import EmailService from '@/services/email.service';

//==================== REGION EMAIL API ====================
// Re-export service methods for backward compatibility
export const getEmails = EmailService.getEmails;
export const getEmailById = EmailService.getEmailById;
export const bulkEmailAction = EmailService.bulkAction;
export const markEmailAsRead = EmailService.markAsRead;
export const markEmailAsUnread = EmailService.markAsUnread;
export const toggleEmailStar = EmailService.toggleStar;
export const deleteEmail = EmailService.delete;
export const sendEmail = EmailService.send;
export const replyEmail = EmailService.reply;
export const modifyEmail = EmailService.modify;
export const updateKanbanStatus = EmailService.updateKanbanStatus;
export const snoozeEmail = EmailService.snoozeEmail;
export const getEmailSummary = EmailService.getEmailSummary;

// Export service class
export { EmailService };

//====================================================
