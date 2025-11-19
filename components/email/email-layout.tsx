'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmailList } from './email-list';
import { EmailDetail } from './email-detail';
import { ParsedMessage } from '@/types';

export interface EmailLayoutProps {
  // Sidebar content
  sidebar?: React.ReactNode;

  // Email list props
  emails?: ParsedMessage[];
  loading?: boolean;
  selectedEmails?: Set<string>;
  onEmailSelect?: (emailId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  error?: string | null;

  // Detail props
  onReply?: (email: ParsedMessage) => void;
  onReplyAll?: (email: ParsedMessage) => void;
  onForward?: (email: ParsedMessage) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onStar?: (emailId: string, starred: boolean) => void;

  // Layout props
  className?: string;
  defaultSidebarWidth?: number;
  defaultListWidth?: number;
}

export function EmailLayout({
  sidebar,
  emails = [],
  loading = false,
  selectedEmails = new Set(),
  onEmailSelect,
  onSelectAll,
  error = null,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onStar,
  className,
  defaultSidebarWidth = 20,
  defaultListWidth = 35,
}: EmailLayoutProps) {
  //Init state hook
  const [selectedEmail, setSelectedEmail] =
    React.useState<ParsedMessage | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();

  //Init event handle
  const handleEmailClick = (email: ParsedMessage) => {
    setSelectedEmail(email);
  };

  const handleBack = () => {
    setSelectedEmail(null);
  };

  //Render mobile layout
  if (isMobile) {
    return (
      <div className={cn('flex h-full w-full flex-col', className)}>
        {/* Mobile Header with Menu Button */}
        <div className="flex h-14 items-center border-b px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] p-0"
              showCloseButton={false}
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="h-full">
                {sidebar &&
                  React.isValidElement(sidebar) &&
                  React.cloneElement(sidebar, {
                    onItemClick: (itemId: string) => {
                      const originalOnItemClick = (
                        sidebar.props as { onItemClick?: (id: string) => void }
                      )?.onItemClick;
                      if (originalOnItemClick) {
                        originalOnItemClick(itemId);
                      }
                      setSidebarOpen(false);
                    },
                  } as Partial<unknown>)}
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="ml-2 text-lg font-semibold">Mail</h1>
        </div>

        {/* Email List - Full width on mobile */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full rounded-none border-0">
            <CardContent className="h-full p-0">
              <EmailList
                emails={emails}
                loading={loading}
                selectedEmails={selectedEmails}
                onEmailSelect={onEmailSelect}
                onEmailClick={handleEmailClick}
                onSelectAll={onSelectAll}
                error={error}
              />
            </CardContent>
          </Card>
        </div>

        {/* Email Detail - Dialog on mobile */}
        {selectedEmail && (
          <Dialog
            open={!!selectedEmail}
            onOpenChange={(open) => !open && handleBack()}
          >
            <DialogContent
              className="h-dvh w-dvw max-w-full p-0 m-0 rounded-none flex flex-col"
              showCloseButton={false}
            >
              <DialogTitle className="sr-only">
                {selectedEmail.subject || 'Email Detail'}
              </DialogTitle>
              <div className="flex-1 min-h-0 overflow-hidden">
                <EmailDetail
                  email={selectedEmail}
                  onBack={handleBack}
                  onReply={onReply}
                  onReplyAll={onReplyAll}
                  onForward={onForward}
                  onArchive={onArchive}
                  onDelete={onDelete}
                  onStar={onStar}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  //Render desktop layout
  return (
    <div className={cn('flex h-full w-full', className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar - Only show on desktop */}
        {sidebar && !isMobile && (
          <>
            <ResizablePanel
              defaultSize={defaultSidebarWidth}
              minSize={15}
              maxSize={30}
              className="border-r"
            >
              <Card className="h-full rounded-none border-0">
                <CardContent className="h-full p-0">{sidebar}</CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Email List */}
        <ResizablePanel
          defaultSize={
            selectedEmail
              ? defaultListWidth
              : 100 - (sidebar ? defaultSidebarWidth : 0)
          }
          minSize={30}
          maxSize={selectedEmail ? 50 : 100}
          className={cn(selectedEmail && 'border-r')}
        >
          <Card className="h-full rounded-none border-0">
            <CardContent className="h-full p-0">
              <EmailList
                emails={emails}
                loading={loading}
                selectedEmails={selectedEmails}
                onEmailSelect={onEmailSelect}
                onEmailClick={handleEmailClick}
                onSelectAll={onSelectAll}
                error={error}
              />
            </CardContent>
          </Card>
        </ResizablePanel>

        {/* Email Detail - Show when email is selected */}
        {selectedEmail && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={100 - defaultSidebarWidth - defaultListWidth}
              minSize={30}
              className="border-l"
            >
              <div className="h-full">
                <EmailDetail
                  email={selectedEmail}
                  onBack={handleBack}
                  onReply={onReply}
                  onReplyAll={onReplyAll}
                  onForward={onForward}
                  onArchive={onArchive}
                  onDelete={onDelete}
                  onStar={onStar}
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
