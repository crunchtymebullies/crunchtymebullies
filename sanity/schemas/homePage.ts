import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero Section' },
    { name: 'categories', title: 'Category Cards' },
    { name: 'about', title: 'About Section' },
    { name: 'sections', title: 'Section Headings' },
    { name: 'cta', title: 'CTA Section' },
  ],
  fields: [
    // Hero
    defineField({ name: 'heroLabel', title: 'Hero Label', type: 'string', group: 'hero', initialValue: 'Premium Breeding Program' }),
    defineField({ name: 'heroHeadingLine1', title: 'Hero Heading Line 1', type: 'string', group: 'hero', initialValue: 'Crunchtime' }),
    defineField({ name: 'heroHeadingLine2', title: 'Hero Heading Line 2', type: 'string', group: 'hero', initialValue: 'Bullies' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'text', rows: 2, group: 'hero' }),
    defineField({ name: 'heroBackground', title: 'Hero Background (Single/Fallback)', type: 'image', group: 'hero', options: { hotspot: true }, description: 'Used if no slideshow images are set' }),
    defineField({ name: 'heroSlides', title: 'Hero Slideshow Images', type: 'array', group: 'hero', of: [{ type: 'image', options: { hotspot: true } }], description: 'Add multiple images for an animated Ken Burns slideshow. Works with any aspect ratio (16:9, portrait, square). Recommended: 3-5 images.' }),
    defineField({ 
      name: 'heroSlideDuration', title: 'Slide Duration (seconds)', type: 'number', group: 'hero',
      description: 'How long each slide stays visible. Default: 4s. Lower = faster.',
      initialValue: 4,
      validation: r => r.min(1).max(30),
    }),
    defineField({ 
      name: 'heroCrossfadeDuration', title: 'Crossfade Speed (seconds)', type: 'number', group: 'hero',
      description: 'How long the fade transition takes. Default: 1s. Lower = snappier.',
      initialValue: 1,
      validation: r => r.min(0.3).max(5),
    }),
    defineField({ 
      name: 'heroKenBurnsDuration', title: 'Ken Burns Zoom Speed (seconds)', type: 'number', group: 'hero',
      description: 'How long the zoom/pan animation takes. Default: 5s. Lower = faster zoom.',
      initialValue: 5,
      validation: r => r.min(2).max(20),
    }),
    defineField({ name: 'heroCta1', title: 'Hero CTA 1', type: 'object', group: 'hero', fields: [
      defineField({ name: 'text', type: 'string', title: 'Text' }),
      defineField({ name: 'href', type: 'string', title: 'Link' }),
      defineField({ name: 'style', type: 'string', title: 'Style', options: { list: ['gold', 'gold-outline', 'white'] } }),
    ]}),
    defineField({ name: 'heroCta2', title: 'Hero CTA 2', type: 'object', group: 'hero', fields: [
      defineField({ name: 'text', type: 'string', title: 'Text' }),
      defineField({ name: 'href', type: 'string', title: 'Link' }),
      defineField({ name: 'style', type: 'string', title: 'Style', options: { list: ['gold', 'gold-outline', 'white'] } }),
    ]}),
    // Marquee
    defineField({ name: 'marqueeItems', title: 'Marquee Items', type: 'array', of: [{ type: 'string' }] }),
    defineField({ 
      name: 'marqueeSpeed', title: 'Marquee Scroll Speed (seconds)', type: 'number',
      description: 'How long for one full scroll cycle. Default: 15s. Lower = faster scroll.',
      initialValue: 15,
      validation: r => r.min(3).max(60),
    }),
    // Category Cards
    defineField({ name: 'categoryCards', title: 'Category Cards', type: 'array', group: 'categories', of: [{
      type: 'object',
      fields: [
        defineField({ name: 'label', type: 'string', title: 'Label' }),
        defineField({ name: 'heading', type: 'string', title: 'Heading' }),
        defineField({ name: 'linkText', type: 'string', title: 'Link Text' }),
        defineField({ name: 'href', type: 'string', title: 'Link URL' }),
        defineField({ name: 'image', type: 'image', title: 'Background Image', options: { hotspot: true } }),
      ],
      preview: { select: { title: 'heading', subtitle: 'href' } },
    }]}),
    // About
    defineField({ name: 'aboutLabel', title: 'About Label', type: 'string', group: 'about' }),
    defineField({ name: 'aboutHeading', title: 'About Heading', type: 'string', group: 'about' }),
    defineField({ name: 'aboutText', title: 'About Text', type: 'text', rows: 4, group: 'about' }),
    defineField({ name: 'aboutImage', title: 'About Image', type: 'image', group: 'about', options: { hotspot: true } }),
    defineField({ name: 'aboutFeatures', title: 'About Features', type: 'array', group: 'about', of: [{
      type: 'object',
      fields: [
        defineField({ name: 'icon', type: 'string', title: 'Icon', options: { list: ['Shield', 'Heart', 'Award', 'Star', 'Check'] } }),
        defineField({ name: 'title', type: 'string', title: 'Title' }),
        defineField({ name: 'subtitle', type: 'string', title: 'Subtitle' }),
      ],
      preview: { select: { title: 'title' } },
    }]}),
    defineField({ name: 'aboutCta', title: 'About CTA', type: 'object', group: 'about', fields: [
      defineField({ name: 'text', type: 'string', title: 'Text' }),
      defineField({ name: 'href', type: 'string', title: 'Link' }),
      defineField({ name: 'style', type: 'string', title: 'Style', options: { list: ['gold', 'gold-outline', 'white'] } }),
    ]}),
    // Section headings
    defineField({ name: 'dogsLabel', title: 'Dogs Section Label', type: 'string', group: 'sections' }),
    defineField({ name: 'dogsHeading', title: 'Dogs Section Heading', type: 'string', group: 'sections' }),
    defineField({ name: 'dogsSubheading', title: 'Dogs Section Subheading', type: 'string', group: 'sections' }),
    defineField({ name: 'reviewsLabel', title: 'Reviews Section Label', type: 'string', group: 'sections' }),
    defineField({ name: 'reviewsHeading', title: 'Reviews Section Heading', type: 'string', group: 'sections' }),
    defineField({ name: 'blogLabel', title: 'Blog Section Label', type: 'string', group: 'sections' }),
    defineField({ name: 'blogHeading', title: 'Blog Section Heading', type: 'string', group: 'sections' }),
    // CTA
    defineField({ name: 'ctaHeading', title: 'CTA Heading', type: 'string', group: 'cta' }),
    defineField({ name: 'ctaText', title: 'CTA Text', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaBackground', title: 'CTA Background', type: 'image', group: 'cta', options: { hotspot: true } }),
    defineField({ name: 'ctaButton1', title: 'CTA Button 1', type: 'object', group: 'cta', fields: [
      defineField({ name: 'text', type: 'string', title: 'Text' }),
      defineField({ name: 'href', type: 'string', title: 'Link' }),
      defineField({ name: 'style', type: 'string', title: 'Style', options: { list: ['gold', 'gold-outline', 'white'] } }),
    ]}),
    defineField({ name: 'ctaButton2', title: 'CTA Button 2', type: 'object', group: 'cta', fields: [
      defineField({ name: 'text', type: 'string', title: 'Text' }),
      defineField({ name: 'href', type: 'string', title: 'Link' }),
      defineField({ name: 'style', type: 'string', title: 'Style', options: { list: ['gold', 'gold-outline', 'white'] } }),
    ]}),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
})
