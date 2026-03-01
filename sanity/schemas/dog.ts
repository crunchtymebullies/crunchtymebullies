import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dog',
  title: 'Dog',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'breed', title: 'Breed', type: 'string', initialValue: 'American Bully' }),
    defineField({ name: 'gender', title: 'Gender', type: 'string', options: { list: ['male', 'female'] } }),
    defineField({ name: 'color', title: 'Color', type: 'string' }),
    defineField({ name: 'dob', title: 'Date of Birth', type: 'date' }),
    defineField({ name: 'weight', title: 'Weight', type: 'string' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: ['available', 'reserved', 'sold', 'stud'] },
      initialValue: 'available',
    }),
    defineField({ name: 'price', title: 'Price', type: 'number' }),
    defineField({ name: 'sire', title: 'Sire (Father)', type: 'string' }),
    defineField({ name: 'dam', title: 'Dam (Mother)', type: 'string' }),
    defineField({ name: 'registry', title: 'Registry', type: 'string', description: 'e.g. ABKC, UKC' }),
    defineField({ name: 'pedigreeUrl', title: 'Pedigree URL', type: 'url' }),
    defineField({
      name: 'healthTests', title: 'Health Tests', type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "DNA tested", "OFA Certified", "Vet Checked"',
    }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'mainImage', title: 'Main Image', type: 'image', options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({
      name: 'gallery', title: 'Photo Gallery', type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'status', media: 'mainImage' },
  },
})
