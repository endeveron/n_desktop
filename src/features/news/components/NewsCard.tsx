'use client';

import { useMemo, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/Tooltip';
import { Card } from '@/components/shared/Card';
import { NEWS_DESCRIPTION_MAX_LENGTH } from '@/features/news/constants';
import { DETAILS } from '@/translations/en';

export interface NewsCardProps {
  link?: string;
  title: string;
  category?: string[] | null;
  description?: string;
}

const NewsCard = ({ link, title, category, description }: NewsCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const openExternalResource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!link) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      openExternalResource(link);
    } else if (e.key === ' ') {
      e.preventDefault();
      setShowTooltip((prev) => !prev);
    }
  };

  const handleBlur = () => {
    setShowTooltip(false);
  };

  const filteredCategory = useMemo(() => {
    if (!Array.isArray(category) || category.length === 0) {
      return null;
    }

    if (category.length === 1) {
      return category[0];
    }

    return category.filter((c) => c !== 'top')[0];
  }, [category]);

  const formattedTitle = useMemo(() => {
    const words = title.split(' ');
    if (words.length === 0) return title;

    const accentText = words.slice(0, 2).join(' ');
    const restOfTitle = words.slice(2).join(' ');

    return (
      <div className="group my-2 text-sm font-bold uppercase line-clamp-2">
        {/* First words */}
        <span className="text-accent">{accentText}</span>

        {/* Rest */}
        {restOfTitle ? (
          <span className="text-secondary group-hover:text-accent trans-c">
            {` `}
            {restOfTitle}
          </span>
        ) : null}
      </div>
    );
  }, [title]);

  return (
    <Card
      className="break-inside-avoid mb-2 last:mb-0"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      focusByTab
    >
      <div className="flex flex-1 flex-col min-w-0 h-full px-3">
        {/* Title */}
        {link ? (
          <a
            href={link}
            target="_blank"
            aria-label={`Open ${title} in new tab`}
            role="link"
            tabIndex={-1}
            className="cursor-pointer hover:text-accent"
          >
            {formattedTitle}
          </a>
        ) : (
          formattedTitle
        )}

        {/* Footer */}
        {filteredCategory || description ? (
          <div className="mb-2 flex justify-between text-[10px] uppercase font-semibold min-w-0 tracking-wide">
            {/* Category */}
            <span className="text-muted/70">{filteredCategory}</span>

            {/* Details */}
            <div className="flex gap-6 text-muted">
              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer">{DETAILS}</span>
                </TooltipTrigger>
                {description && (
                  <TooltipContent
                    side="bottom"
                    className="dark:text-foreground/95 max-w-sm p-6"
                  >
                    {description.length > NEWS_DESCRIPTION_MAX_LENGTH
                      ? `${description.slice(
                          0,
                          NEWS_DESCRIPTION_MAX_LENGTH
                        )}...`
                      : description}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
};
export default NewsCard;
