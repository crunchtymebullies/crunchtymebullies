import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Customer Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'rating', title: 'Rating (1-5)', type: 'number', validation: (r) => r.min(1).max(5), initialValue: 5 }),
    defineField({ name: 'text', title: 'Review Text', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'dogPurchased', title: 'Dog Purchased', type: 'string' }),
    defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'date', title: 'Date', type: 'date', initialValue: () => new Date().toISOString().split('T')[0] }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'rating' },
    prepare({ title, subtitle }) {
      return { title, subtitle: '★'.repeat(subtitle || 0) }
    },
  },
})
