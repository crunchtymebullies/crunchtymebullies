import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dog',
  title: 'Dog',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'photos', title: 'Photos & Gallery' },
    { name: 'breeding', title: 'Breeding & Pedigree' },
    { name: 'health', title: 'Health' },
    { name: 'documents', title: 'Documents' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', group: 'basic', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'basic', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'breed', title: 'Breed', type: 'string', group: 'basic', initialValue: 'American Bully' }),
    defineField({ name: 'variety', title: 'Variety', type: 'string', group: 'basic', options: { list: ['Standard', 'Classic', 'Pocket', 'XL', 'Micro', 'Exotic'] }, description: 'American Bully variety/class' }),
    defineField({ name: 'gender', title: 'Gender', type: 'string', group: 'basic', options: { list: ['male', 'female'] } }),
    defineField({ name: 'color', title: 'Color', type: 'string', group: 'basic' }),
    defineField({ name: 'dob', title: 'Date of Birth', type: 'date', group: 'basic' }),
    defineField({ name: 'weight', title: 'Weight', type: 'string', group: 'basic', description: 'e.g. "65 lbs"' }),
    defineField({ name: 'height', title: 'Height', type: 'string', group: 'basic', description: 'e.g. "17 inches"' }),
    defineField({
      name: 'status', title: 'Status', type: 'string', group: 'basic',
      options: { list: ['available', 'reserved', 'sold', 'stud', 'retired', 'upcoming'] },
      initialValue: 'available',
    }),
    defineField({ name: 'price', title: 'Price', type: 'number', group: 'basic' }),
    defineField({ name: 'featured', title: 'Featured on Homepage', type: 'boolean', group: 'basic', initialValue: false }),
    defineField({ name: 'description', title: 'Description', type: 'array', group: 'basic', of: [{ type: 'block' }] }),
    defineField({ name: 'personality', title: 'Personality / Temperament', type: 'text', group: 'basic', rows: 3, description: 'Short personality description shown on the profile' }),

    defineField({ name: 'mainImage', title: 'Main Photo', type: 'image', group: 'photos', options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({
      name: 'gallery', title: 'Photo Gallery', type: 'array', group: 'photos',
      of: [{ type: 'image', options: { hotspot: true }, fields: [
        { name: 'caption', type: 'string', title: 'Caption' },
      ]}],
      description: 'Add as many photos as you like. They display in the gallery on the dog profile page.',
    }),

    defineField({ name: 'sire', title: 'Sire (Father)', type: 'string', group: 'breeding' }),
    defineField({ name: 'dam', title: 'Dam (Mother)', type: 'string', group: 'breeding' }),
    defineField({ name: 'bloodline', title: 'Bloodline', type: 'string', group: 'breeding', description: 'e.g. "Razors Edge", "Gottiline", "Daxline"' }),
    defineField({ name: 'registry', title: 'Registry', type: 'string', group: 'breeding', description: 'e.g. ABKC, UKC, AKC' }),
    defineField({ name: 'registrationNumber', title: 'Registration Number', type: 'string', group: 'breeding' }),
    defineField({ name: 'pedigreeUrl', title: 'Pedigree URL (external link)', type: 'url', group: 'breeding' }),

    defineField({
      name: 'healthTests', title: 'Health Tests', type: 'array', group: 'health',
      of: [{ type: 'string' }],
      description: 'e.g. "DNA Panel - Clear", "OFA Hips - Good", "Cardiac - Normal"',
    }),
    defineField({ name: 'healthNotes', title: 'Health Notes', type: 'text', group: 'health', rows: 3 }),

    defineField({
      name: 'documents', title: 'Documents & Paperwork', type: 'array', group: 'documents',
      of: [{
        type: 'file',
        fields: [
          { name: 'title', type: 'string', title: 'Document Title', description: 'e.g. "ABKC Registration", "DNA Results", "Pedigree Certificate"' },
          { name: 'docType', type: 'string', title: 'Document Type', options: {
            list: ['registration', 'pedigree', 'dna', 'health', 'contract', 'other']
          }},
        ]
      }],
      description: 'Upload PDFs, images, or other files — registration papers, pedigree certs, DNA results, health clearances, etc.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'status', media: 'mainImage' },
  },
})
