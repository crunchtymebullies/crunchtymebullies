import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Site Title', type: 'string', initialValue: 'Crunchtime Bullies' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', initialValue: 'Premium Puppies & Lifestyle Apparel' }),
    defineField({ name: 'description', title: 'Meta Description', type: 'text', rows: 2 }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({ name: 'logoAlt', title: 'Logo Alt (light variant)', type: 'image' }),
    defineField({ name: 'heroImages', title: 'Hero Slideshow Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string', initialValue: 'crunchtimebullies@gmail.com' }),
    defineField({ name: 'address', title: 'Address', type: 'string' }),
    defineField({
      name: 'socialLinks', title: 'Social Links', type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
      ],
    }),
    defineField({
      name: 'announcement', title: 'Announcement Bar', type: 'object',
      fields: [
        defineField({ name: 'text', title: 'Text', type: 'string' }),
        defineField({ name: 'link', title: 'Link', type: 'string' }),
        defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
      ],
    }),
  ],
  preview: { select: { title: 'title' } },
})
