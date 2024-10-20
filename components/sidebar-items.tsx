'use client'

import { Query } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { removeQuery, shareQuery } from '@/app/actions'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'

interface SidebarItemsProps {
  queries?: Query[];
}

export function SidebarItems({ queries }: SidebarItemsProps) {
  if (!queries?.length) return null

  return (
    <AnimatePresence>
      {queries.map(
        (query, index) =>
          query && (
            <motion.div
              key={query?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem index={index} query={query}>
                <SidebarActions
                  query={query}
                  removeQuery={removeQuery}
                  shareQuery={shareQuery}
                />
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
