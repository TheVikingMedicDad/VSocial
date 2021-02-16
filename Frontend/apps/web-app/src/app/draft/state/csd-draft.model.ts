import { ID } from '../../core/core.types';

export interface Draft {
  id: ID;
  data: any;
  dataId: ID;
  created: Date;
  updated: Date;
}

export interface DraftList {
  drafts: Draft[];
}
