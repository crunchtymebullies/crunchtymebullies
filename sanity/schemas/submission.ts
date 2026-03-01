import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'submission',
  title: 'Client Submission',
  type: 'document',
  fields: [
    defineField({ name: 'submissionType', title: 'Type', type: 'string', options: { list: ['dog-photo', 'dog-info', 'stripe-credentials', 'store-info', 'branding', 'social', 'content', 'services', 'developer-message', 'contact-form'] } }),
    defineField({ name: 'data', title: 'Submitted Data', type: 'object', fields: [
      defineField({ name: 'json', title: 'JSON Data', type: 'text' }),
    ]}),
    defineField({ name: 'submittedAt', title: 'Submitted At', type: 'datetime' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['new', 'reviewed', 'processed'] }, initialValue: 'new' }),
    defineField({ name: 'notes', title: 'Admin Notes', type: 'text' }),
  ],
  preview: { select: { title: 'submissionType', subtitle: 'submittedAt' } },
})
