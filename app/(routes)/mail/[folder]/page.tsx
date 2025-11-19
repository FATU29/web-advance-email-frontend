'use client';

import * as React from 'react';

import { EmailLayout } from '@/components/email/email-layout';
import { MockSidebar } from '@/mocks/sidebar';
import { mockEmails } from '@/mocks/emails';
import { ParsedMessage } from '@/types';
import { type Message } from '@/components/ui/chat-message';
import { ChatDialog } from '@/components/chat/chat-dialog';

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
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

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

  //Init chat handlers
  const handleChatSubmit = (
    event?: { preventDefault?: () => void },
    _options?: { experimental_attachments?: FileList }
  ) => {
    event?.preventDefault?.();
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      createdAt: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);

    // TODO: Implement chat API call
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'This is a placeholder response. Please implement the chat API.',
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatStop = () => {
    setIsGenerating(false);
    // TODO: Implement stop generation
  };

  const handleChatAppend = (message: { role: 'user'; content: string }) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: message.role,
      content: message.content,
      createdAt: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);

    // TODO: Implement chat API call
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'This is a placeholder response. Please implement the chat API.',
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  const chatSuggestions = [
    'Summarize my emails',
    'Find important emails',
    'Draft a reply',
    'Check my schedule',
  ];

  //Render
  return (
    <div className="relative flex h-screen w-full flex-col">
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

      {/* Sticky Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <ChatDialog
          triggerSize="icon"
          triggerVariant="default"
          triggerClassName="h-14 w-14 rounded-full shadow-lg"
          messages={chatMessages}
          handleSubmit={handleChatSubmit}
          input={chatInput}
          handleInputChange={handleChatInputChange}
          isGenerating={isGenerating}
          stop={handleChatStop}
          setMessages={setChatMessages}
          append={handleChatAppend}
          suggestions={chatSuggestions}
        />
      </div>
    </div>
  );
}
