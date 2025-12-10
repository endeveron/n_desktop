'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/shadcn/Button';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import UpdateButton from '@/components/shared/UpdateButton';
import { useStore } from '@/store';
import { GET_FACT_BTN_LABEL } from '@/translations/en';
import { cn, getRandomString } from '@/utils';

const Facts = () => {
  const fact = useStore((state) => state.fact);
  const factIDArray = useStore((state) => state.factIDArray);
  const factsOffset = useStore((state) => state.factsOffset);
  const isFactsFetching = useStore((state) => state.isFactsFetching);
  const isFactsInitialized = useStore((state) => state.isFactsInitialized);
  const fetchFact = useStore((state) => state.fetchFact);
  const fetchFactIDArray = useStore((state) => state.fetchFactIDArray);
  // const resetFacts = useStore((state) => state.resetFacts);

  const [mounted, setMounted] = useState(false);

  const factIdArrLength = factIDArray.length;

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  const initializeFactIDArray = useCallback(async () => {
    const success = await fetchFactIDArray();

    if (!success) {
      toast('Unable to initialize facts');
      return;
    }
  }, [fetchFactIDArray]);

  const retrieveFact = useCallback(async () => {
    const errMsg = 'Unable to retrieve fact';

    // Get random fact id
    const randomId = getRandomString(factIDArray);
    if (!randomId) {
      toast(errMsg);
      return;
    }

    const success = await fetchFact(randomId);
    if (!success) {
      toast(errMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factIdArrLength, fetchFact, mounted]);

  // Initialize fact ID array
  useEffect(() => {
    if (!mounted || factIdArrLength) return;

    initializeFactIDArray();
  }, [factIdArrLength, initializeFactIDArray, mounted]);

  // Init fact on mount
  useEffect(() => {
    // Exit if component not ready or fact ID array not initialized
    if (!mounted || !isFactsInitialized) return;

    retrieveFact();

    // Don't add retrieveFact, it causes infinite loop
    // because of it depends on factIDArray, that changes
    // with each fact fetch (fact id remove from it)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFactsInitialized, mounted]);

  if (!fact || isFactsFetching) {
    return (
      <Card size="xs">
        <Loading />
      </Card>
    );
  }

  return (
    <Card className="py-3 px-3">
      <div className="w-full flex-col">
        {fact ? (
          <div
            className={cn(
              'anim-fade text-sm text-secondary font-semibold tracking-wide mb-2 py-1 trans-o',
              isFactsFetching && 'opacity-20'
            )}
          >
            {fact.title}
          </div>
        ) : null}

        <div className="w-full flex items-center justify-between gap-2">
          {fact?.category ? (
            <div
              className={cn(
                'flex gap-3 text-[10px] font-bold uppercase tracking-wide text-muted/70 trans-o select-none',
                isFactsFetching && 'opacity-40'
              )}
            >
              {factIdArrLength ? (
                <span>{factsOffset - factIdArrLength}</span>
              ) : null}
              <span>{fact.category}</span>
            </div>
          ) : null}

          {fact ? (
            <UpdateButton loading={isFactsFetching} onUpdate={retrieveFact} />
          ) : (
            <Button
              loading={isFactsFetching}
              onClick={retrieveFact}
              size="sm"
              variant="outline"
            >
              {GET_FACT_BTN_LABEL}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Facts;
