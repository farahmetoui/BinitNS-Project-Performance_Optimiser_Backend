import { Response, Request } from 'express';
import { isObject, isString } from 'jet-validators';
import { parseObject, TSchema } from 'jet-validators/utils';

import { ValidationErr } from '@src/common/route-errors';


/******************************************************************************
                                Types
******************************************************************************/

type TRecord = Record<string, unknown>;
export type IReq = Request<TRecord, void, TRecord, TRecord>;
export type IRes = Response<unknown, TRecord>;

export interface IReqPropErr {
  prop: string;
  value: unknown;
  moreInfo?: string;
}


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Parse a Request object property and throw a Validation error if it fails.
 */
export function parseReq<U extends TSchema>(schema: U) {
  return (arg: unknown) => {
    if (isObject(arg)) {
      arg = { ...arg };
    }
    const errArr: IReqPropErr[] = [];

    // Adapt error callback to map IParseObjectError[] to IReqPropErr[]
    const errCb = (errors: any[]) => {
      errArr.push(
        ...errors.map((err) => ({
          prop: err.prop ?? '',
          value: err.value,
          moreInfo: err.moreInfo,
        }))
      );
    };

    const schemaTyped = schema as unknown as TSchema<U>;
    const retVal = parseObject<U>(schemaTyped, errCb)(arg);

    if (errArr.length > 0) {
      throw new ValidationErr(errArr);
    }
    return retVal;
  };
}
