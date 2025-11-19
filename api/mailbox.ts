import MailboxService from '@/services/mailbox.service';

//==================== REGION MAILBOX API ====================
// Re-export service methods for backward compatibility
export const getMailboxes = MailboxService.getMailboxes;
export const getMailboxById = MailboxService.getMailboxById;

// Export service class
export { MailboxService };

//====================================================
