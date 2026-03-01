import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'branding', title: 'Branding' },
    { name: 'header', title: 'Header & Navigation' },
    { name: 'footer', title: 'Footer' },
    { name: 'contact', title: 'Contact Info' },
    { name: 'social', title: 'Social Links' },
    { name: 'seo', title: 'SEO & Meta' },
  ],
  fields: [
    // ─── BRANDING ───
    defineField({ name: 'title', title: 'Site Title', type: 'string', initialValue: 'Crunchtime Bullies', group: 'branding' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'branding' }),
    defineField({
      name: 'logo', title: 'Logo (Main)', type: 'image', group: 'branding',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt Text', type: 'string', initialValue: 'Crunchtime Bullies Logo' }),
        defineField({
          name: 'fit', title: 'Fit Mode', type: 'string',
          options: { list: ['contain', 'cover', 'fill', 'none', 'scale-down'] },
          initialValue: 'contain',
        }),
      ],
    }),
    defineField({
      name: 'logoDark', title: 'Logo (Dark / Alt)', type: 'image', group: 'branding',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'favicon', title: 'Favicon', type: 'image', group: 'branding',
    }),

    // ─── HEADER ───
    defineField({
      name: 'announcement', title: 'Announcement Bar', type: 'object', group: 'header',
      fields: [
        defineField({ name: 'text', title: 'Text', type: 'string', initialValue: 'Free Shipping on Orders Over $40' }),
        defineField({ name: 'link', title: 'Link URL', type: 'string', initialValue: '/shop' }),
        defineField({ name: 'active', title: 'Show Announcement', type: 'boolean', initialValue: true }),
      ],
    }),
    defineField({
      name: 'navigation', title: 'Navigation Links', type: 'array', group: 'header',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href', title: 'URL', type: 'string' }),
        ],
        preview: { select: { title: 'label', subtitle: 'href' } },
      }],
    }),

    // ─── FOOTER ───
    defineField({
      name: 'footerText', title: 'Footer About Text', type: 'text', rows: 3, group: 'footer',
      initialValue: 'Premium American Bully breeding. Quality bloodlines, health-tested puppies, and world-class breeding services.',
    }),
    defineField({ name: 'copyright', title: 'Copyright Text', type: 'string', group: 'footer', initialValue: '© 2026 Crunchtime Bullies. All rights reserved.' }),
    defineField({
      name: 'footerLinks', title: 'Footer Link Columns', type: 'array', group: 'footer',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'heading', title: 'Column Heading', type: 'string' }),
          defineField({
            name: 'links', title: 'Links', type: 'array',
            of: [{
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string' }),
                defineField({ name: 'href', title: 'URL', type: 'string' }),
              ],
              preview: { select: { title: 'label', subtitle: 'href' } },
            }],
          }),
        ],
        preview: { select: { title: 'heading' } },
      }],
    }),
    defineField({
      name: 'paymentIcons', title: 'Payment Icons Image', type: 'image', group: 'footer',
    }),

    // ─── CONTACT ───
    defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'contact' }),
    defineField({ name: 'email', title: 'Email', type: 'string', group: 'contact', initialValue: 'crunchtimebullies@gmail.com' }),
    defineField({ name: 'address', title: 'Address', type: 'text', rows: 2, group: 'contact' }),

    // ─── SOCIAL ───
    defineField({
      name: 'socialLinks', title: 'Social Links', type: 'object', group: 'social',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook URL', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok URL', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube URL', type: 'url' }),
        defineField({ name: 'twitter', title: 'X / Twitter URL', type: 'url' }),
      ],
    }),

    // ─── SEO ───
    defineField({ name: 'metaDescription', title: 'Default Meta Description', type: 'text', rows: 2, group: 'seo' }),
    defineField({ name: 'ogImage', title: 'Default OG Image', type: 'image', group: 'seo' }),
    defineField({ name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }], group: 'seo' }),
  ],
  preview: { select: { title: 'title' } },
})
