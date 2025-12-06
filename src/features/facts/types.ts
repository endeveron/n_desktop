import { ObjectId } from 'mongoose';

export type FactData = {
  title: string;
  category: string;
};

export type FactDB = FactData & {
  _id: ObjectId;
};

export type FactItem = FactData & {
  id: string;
};

export type FactCategoryMap = Map<string, number>;

export enum FactCategories {
  nature = 'nature',
  human = 'human',
  entertainment = 'entertainment',
  science = 'science',
  business = 'business',
  miscellaneous = 'miscellaneous',
}
