'use server';

import { FACT_FETCHING_LIMIT } from '@/features/facts/constants';
import getFactModel from '@/features/facts/models/fact';
import { FactDB, FactItem } from '@/features/facts/types';
import { ServerActionResult } from '@/types';
import { logWithTime } from '@/utils';
import { handleActionError } from '@/utils/error';

export const getFacts = async (): Promise<ServerActionResult<FactItem[]>> => {
  try {
    const FactModel = await getFactModel();

    const docs = await FactModel.find<FactDB>({});

    if (!docs.length) {
      return {
        success: true,
        data: [],
      };
    }

    const factItems: FactItem[] = docs.map((d) => ({
      id: d._id.toString(),
      category: d.category,
      title: d.title,
    }));

    return {
      success: true,
      data: factItems,
    };
  } catch (err: unknown) {
    logWithTime('getFacts: Error');

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getFacts: Unknown error occurred'),
    };
  }
};

export const getFactIDArray = async (
  offset = 0
): Promise<ServerActionResult<string[]>> => {
  try {
    const FactModel = await getFactModel();

    const docs = await FactModel.find<FactDB>({})
      .skip(offset)
      .limit(FACT_FETCHING_LIMIT);

    if (!docs.length) {
      return {
        success: true,
        data: [],
      };
    }

    const factIDArray: string[] = docs.map((d) => d._id.toString());

    return {
      success: true,
      data: factIDArray,
    };
  } catch (err: unknown) {
    logWithTime('getFactIDArray: Error');

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getFactIDArray: Unknown error occurred'),
    };
  }
};

export const getFact = async (
  id: string
): Promise<ServerActionResult<FactItem>> => {
  try {
    const FactModel = await getFactModel();

    const doc = await FactModel.findById(id);

    if (!doc) {
      return handleActionError('Unable to find a fact with provided ID');
    }

    const factItem: FactItem = {
      id: doc._id.toString(),
      category: doc.category,
      title: doc.title,
    };

    return {
      success: true,
      data: factItem,
    };
  } catch (err: unknown) {
    logWithTime('getFact: Error');

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getFact: Unknown error occurred'),
    };
  }
};
