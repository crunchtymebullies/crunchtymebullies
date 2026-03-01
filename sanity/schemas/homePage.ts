import { defineField, defineType } from 'sanity'

const imageWithSettings = (name: string, title: string, group?: string) =>
  defineField({
    name, title, type: 'image', group,
    options: { hotspot: true },
    fields: [
      defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
      defineField({
        name: 'fit', title: 'Object Fit', type: 'string',
        options: { list: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
        initialValue: 'cover',
      }),
      defineField({
        name: 'position', title: 'Object Position', type: 'string',
        options: { list: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'] },
        initialValue: 'center',
      }),
      defineField({ name: 'opacity', title: 'Overlay Opacity (0-100)', type: 'number', initialValue: 30 }),
    ],
  })

const ctaButton = (name: string, title: string) =>
  defineField({
    name, title, type: 'object',
    fields: [
      defineField({ name: 'text', title: 'Button Text', type: 'string' }),
      defineField({ name: 'href', title: 'Link URL', type: 'string' }),
      defineField({
        name: 'style', title: 'Style', type: 'string',
        options: { list: ['gold', 'gold-outline', 'white', 'white-outline'] },
        initialValue: 'gold',
      }),
    ],
  })

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  groups: [
    { name: 'hero', title: '🦸 Hero Section' },
    { name: 'marquee', title: '📢 Marquee' },
    { name: 'categories', title: '🗂️ Category Cards' },
    { name: 'about', title: '📖 About Preview' },
    { name: 'dogs', title: '🐕 Featured Dogs' },
    { name: 'reviews', title: '⭐ Reviews' },
    { name: 'blog', title: '📝 Blog Preview' },
    { name: 'cta', title: '📣 Final CTA' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Page Title (internal)', type: 'string', initialValue: 'Home Page' }),

    // ═══ HERO ═══
    defineField({ name: 'heroLabel', title: 'Hero Label', type: 'string', group: 'hero', initialValue: 'Premium Breeding Program' }),
    defineField({ name: 'heroHeadingLine1', title: 'Hero Heading Line 1', type: 'string', group: 'hero', initialValue: 'Crunchtime' }),
    defineField({ name: 'heroHeadingLine2', title: 'Hero Heading Line 2 (gold)', type: 'string', group: 'hero', initialValue: 'Bullies' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'text', rows: 3, group: 'hero', initialValue: 'Premium American Bully breeding. Quality bloodlines, health-tested puppies, and world-class breeding services.' }),
    imageWithSettings('heroBackground', 'Hero Background Image', 'hero'),
    ctaButton('heroCta1', 'Hero Button 1 (Primary)'),
    ctaButton('heroCta2', 'Hero Button 2 (Secondary)'),

    // ═══ MARQUEE ═══
    defineField({
      name: 'marqueeItems', title: 'Marquee Scroll Items', type: 'array', group: 'marquee',
      of: [{ type: 'string' }],
      initialValue: ['Premium Puppies', 'Quality Bloodlines', 'Health Tested', 'ABKC Registered', 'Professional Breeding', 'Lifetime Support'],
    }),

    // ═══ CATEGORY CARDS ═══
    defineField({
      name: 'categoryCards', title: 'Category Cards', type: 'array', group: 'categories',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Top Label', type: 'string', initialValue: 'Browse' }),
          defineField({ name: 'heading', title: 'Heading', type: 'string' }),
          defineField({ name: 'linkText', title: 'Link Text', type: 'string' }),
          defineField({ name: 'href', title: 'Link URL', type: 'string' }),
          defineField({
            name: 'image', title: 'Background Image', type: 'image',
            options: { hotspot: true },
            fields: [
              defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
              defineField({
                name: 'fit', title: 'Object Fit', type: 'string',
                options: { list: ['cover', 'contain', 'fill'] },
                initialValue: 'cover',
              }),
              defineField({
                name: 'position', title: 'Object Position', type: 'string',
                options: { list: ['center', 'top', 'bottom', 'left', 'right'] },
                initialValue: 'center',
              }),
            ],
          }),
        ],
        preview: {
          select: { title: 'heading', media: 'image' },
        },
      }],
    }),

    // ═══ ABOUT PREVIEW ═══
    defineField({ name: 'aboutLabel', title: 'Section Label', type: 'string', group: 'about', initialValue: 'About Us' }),
    defineField({ name: 'aboutHeading', title: 'Section Heading', type: 'string', group: 'about', initialValue: 'Puppies You Can Count On' }),
    defineField({ name: 'aboutText', title: 'About Text', type: 'array', of: [{ type: 'block' }], group: 'about' }),
    imageWithSettings('aboutImage', 'About Section Image', 'about'),
    defineField({
      name: 'aboutFeatures', title: 'Feature Pills', type: 'array', group: 'about',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'icon', title: 'Icon Name', type: 'string', description: 'e.g. Shield, Award, Heart, Star, Check' }),
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
        ],
        preview: { select: { title: 'title', subtitle: 'subtitle' } },
      }],
    }),
    ctaButton('aboutCta', 'About CTA Button'),

    // ═══ FEATURED DOGS ═══
    defineField({ name: 'dogsLabel', title: 'Section Label', type: 'string', group: 'dogs', initialValue: 'Our Dogs' }),
    defineField({ name: 'dogsHeading', title: 'Section Heading', type: 'string', group: 'dogs', initialValue: 'Featured Bullies' }),
    defineField({ name: 'dogsSubheading', title: 'Section Subheading', type: 'text', rows: 2, group: 'dogs' }),

    // ═══ REVIEWS ═══
    defineField({ name: 'reviewsLabel', title: 'Section Label', type: 'string', group: 'reviews', initialValue: 'Testimonials' }),
    defineField({ name: 'reviewsHeading', title: 'Section Heading', type: 'string', group: 'reviews', initialValue: 'What Our Clients Say' }),

    // ═══ BLOG PREVIEW ═══
    defineField({ name: 'blogLabel', title: 'Section Label', type: 'string', group: 'blog', initialValue: 'From The Blog' }),
    defineField({ name: 'blogHeading', title: 'Section Heading', type: 'string', group: 'blog', initialValue: 'Latest Posts' }),

    // ═══ FINAL CTA ═══
    defineField({ name: 'ctaHeading', title: 'CTA Heading', type: 'string', group: 'cta', initialValue: 'Ready to Find Your Perfect Bully?' }),
    defineField({ name: 'ctaText', title: 'CTA Text', type: 'text', rows: 2, group: 'cta' }),
    imageWithSettings('ctaBackground', 'CTA Background Image', 'cta'),
    ctaButton('ctaButton1', 'CTA Button 1'),
    ctaButton('ctaButton2', 'CTA Button 2'),
  ],
  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
})
