import type { CollectionConfig } from 'payload'
import { normalizePath } from '@/lib/normalizePath'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'type'],
    description: '301/302 redirects. They are created automatically when the slug of a page or post changes.',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.from) data.from = normalizePath(data.from)
        if (data?.to && data.to.startsWith('/')) data.to = normalizePath(data.to)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Old path, e.g. /roofing-seattle' },
      validate: (value: unknown) =>
        (typeof value === 'string' && value.trim().startsWith('/')) || 'Must start with /',
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'New path (/roofing/seattle) or full URL (https://...)' },
      validate: (value: unknown, { siblingData }: { siblingData: { from?: string } }) => {
        if (typeof value !== 'string' || !/^(https?:\/\/|\/)/.test(value.trim())) {
          return 'Must start with / or https://'
        }
        if (normalizePath(value) === normalizePath(siblingData?.from ?? '')) {
          return 'The destination cannot be the same as the origin'
        }
        return true
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301 – Permanent (recommended)', value: '301' },
        { label: '302 – Temporary', value: '302' },
      ],
    },
  ],
}
