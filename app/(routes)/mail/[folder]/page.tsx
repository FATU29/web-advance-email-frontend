'use client';

import * as React from 'react';

import { EmailLayout } from '@/components/email/email-layout';
import { MockSidebar } from '@/mocks/sidebar';
import { mockEmails } from '@/mocks/emails';
import { ParsedMessage } from '@/types';

export default function MailFolderPage({
  params: _params,
}: {
  params: { folder: string };
}) {
  //Init state hook
  const [emails, setEmails] = React.useState<ParsedMessage[]>(mockEmails);
  const [loading] = React.useState(false);
  const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(
    new Set()
  );

  //Init event handle
  const handleEmailSelect = (emailId: string, selected: boolean) => {
    const newSelected = new Set(selectedEmails);
    if (selected) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEmails(new Set(emails.map((email) => email.id)));
    } else {
      setSelectedEmails(new Set());
    }
  };

  const handleReply = (_email: ParsedMessage) => {
    // TODO: Implement reply functionality
  };

  const handleReplyAll = (_email: ParsedMessage) => {
    // TODO: Implement reply all functionality
  };

  const handleForward = (_email: ParsedMessage) => {
    // TODO: Implement forward functionality
  };

  const handleArchive = (_emailId: string) => {
    // TODO: Implement archive functionality
  };

  const handleDelete = (emailId: string) => {
    setEmails(emails.filter((email) => email.id !== emailId));
    const newSelected = new Set(selectedEmails);
    newSelected.delete(emailId);
    setSelectedEmails(newSelected);
  };

  const handleStar = (_emailId: string, _starred: boolean) => {
    // TODO: Implement star functionality
  };

  const handleSidebarItemClick = (_itemId: string) => {
    // TODO: Implement folder navigation
  };

  const handleComposeClick = () => {
    // TODO: Implement compose email functionality
  };

  const handleLogoutClick = () => {
    // TODO: Implement logout functionality
  };

  //Render
  return (
    <div className="flex h-screen w-full flex-col">
      <EmailLayout
        sidebar={
          <MockSidebar
            onItemClick={handleSidebarItemClick}
            onComposeClick={handleComposeClick}
            onLogoutClick={handleLogoutClick}
          />
        }
        emails={emails}
        loading={loading}
        selectedEmails={selectedEmails}
        onEmailSelect={handleEmailSelect}
        onSelectAll={handleSelectAll}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onStar={handleStar}
        className="h-full"
      />
    </div>
  );
}
