import { ParsedMessage } from '@/types';

export const mockEmails: ParsedMessage[] = [
  {
    id: '1',
    title: 'Welcome to our service',
    subject: 'Welcome to our service',
    tags: [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'system',
      },
    ],
    sender: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    to: [
      {
        name: 'You',
        email: 'user@example.com',
      },
    ],
    cc: null,
    bcc: null,
    tls: true,
    receivedOn: new Date().toISOString(),
    unread: true,
    body: 'Thank you for signing up! We are excited to have you on board.',
    processedHtml:
      '<p>Thank you for signing up! We are excited to have you on board.</p>',
    blobUrl: '',
    isDraft: false,
    attachments: [],
  },
  {
    id: '2',
    title: 'Meeting Reminder',
    subject: 'Meeting Reminder - Tomorrow at 2 PM',
    tags: [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'system',
      },
      {
        id: 'important',
        name: 'Important',
        type: 'user',
        color: {
          backgroundColor: '#FF6B6B',
          textColor: '#FFFFFF',
        },
      },
    ],
    sender: {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
    },
    to: [
      {
        name: 'You',
        email: 'user@example.com',
      },
    ],
    cc: [
      {
        name: 'Team Lead',
        email: 'teamlead@company.com',
      },
    ],
    bcc: null,
    tls: true,
    receivedOn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: true,
    body: 'This is a reminder that we have a team meeting tomorrow at 2 PM. Please prepare your quarterly report.',
    processedHtml:
      '<p>This is a reminder that we have a team meeting tomorrow at 2 PM. Please prepare your quarterly report.</p>',
    blobUrl: '',
    isDraft: false,
    attachments: [
      {
        attachmentId: 'att1',
        filename: 'agenda.pdf',
        mimeType: 'application/pdf',
        size: 245760,
        body: '',
        headers: [],
      },
    ],
  },
  {
    id: '3',
    title: 'Project Update',
    subject: 'Project Update - Q4 2024',
    tags: [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'system',
      },
      {
        id: 'work',
        name: 'Work',
        type: 'user',
        color: {
          backgroundColor: '#4ECDC4',
          textColor: '#FFFFFF',
        },
      },
    ],
    sender: {
      name: 'Mike Johnson',
      email: 'mike.j@company.com',
    },
    to: [
      {
        name: 'You',
        email: 'user@example.com',
      },
    ],
    cc: null,
    bcc: null,
    tls: true,
    receivedOn: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unread: false,
    body: 'Here is the latest update on the Q4 project. We are on track to meet all our deadlines.',
    processedHtml:
      '<p>Here is the latest update on the Q4 project. We are on track to meet all our deadlines.</p><ul><li>Task 1: Completed</li><li>Task 2: In Progress</li><li>Task 3: Pending</li></ul>',
    blobUrl: '',
    isDraft: false,
    attachments: [],
  },
  {
    id: '4',
    title: 'Newsletter',
    subject: 'Weekly Newsletter - Tech Updates',
    tags: [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'system',
      },
      {
        id: 'newsletter',
        name: 'Newsletter',
        type: 'user',
        color: {
          backgroundColor: '#95E1D3',
          textColor: '#000000',
        },
      },
    ],
    sender: {
      name: 'Tech News',
      email: 'newsletter@technews.com',
    },
    to: [
      {
        name: 'You',
        email: 'user@example.com',
      },
    ],
    cc: null,
    bcc: null,
    tls: true,
    receivedOn: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
    body: 'Check out the latest tech news and updates from this week. New features, bug fixes, and more!',
    processedHtml:
      '<h2>Weekly Tech Updates</h2><p>Check out the latest tech news and updates from this week. New features, bug fixes, and more!</p>',
    blobUrl: '',
    isDraft: false,
    attachments: [],
  },
  {
    id: '5',
    title: 'Draft Email',
    subject: 'Draft: Proposal for New Feature',
    tags: [
      {
        id: 'draft',
        name: 'Draft',
        type: 'system',
      },
    ],
    sender: {
      name: 'You',
      email: 'user@example.com',
    },
    to: [
      {
        name: 'Manager',
        email: 'manager@company.com',
      },
    ],
    cc: null,
    bcc: null,
    tls: true,
    receivedOn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
    body: 'I would like to propose a new feature that could improve our workflow...',
    processedHtml:
      '<p>I would like to propose a new feature that could improve our workflow...</p>',
    blobUrl: '',
    isDraft: true,
    attachments: [],
  },
  {
    id: '6',
    title: 'Invoice',
    subject: 'Invoice #12345 - Payment Due',
    tags: [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'system',
      },
      {
        id: 'finance',
        name: 'Finance',
        type: 'user',
        color: {
          backgroundColor: '#F38181',
          textColor: '#FFFFFF',
        },
      },
    ],
    sender: {
      name: 'Billing Department',
      email: 'billing@service.com',
    },
    to: [
      {
        name: 'You',
        email: 'user@example.com',
      },
    ],
    cc: null,
    bcc: null,
    tls: true,
    receivedOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    unread: false,
    body: 'Please find attached your invoice for this month. Payment is due within 30 days.',
    processedHtml:
      '<p>Please find attached your invoice for this month. Payment is due within 30 days.</p>',
    blobUrl: '',
    isDraft: false,
    attachments: [
      {
        attachmentId: 'att2',
        filename: 'invoice_12345.pdf',
        mimeType: 'application/pdf',
        size: 512000,
        body: '',
        headers: [],
      },
    ],
  },
];
