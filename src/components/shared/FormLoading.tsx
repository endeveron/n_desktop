'use client';

import Loading from '@/components/shared/Loading';
import { cn } from '@/utils';

type TFormLoadingProps = {
  isPending: boolean;
  loadigIconClassName?: string;
};

const FormLoading = ({ isPending, loadigIconClassName }: TFormLoadingProps) => {
  return (
    <div
      className={cn(
        'opacity-0 absolute m-0! inset-0 flex-center -z-10 trans-o',
        isPending && 'opacity-90 z-10'
      )}
    >
      <div className={cn(loadigIconClassName)}>
        <Loading />
      </div>
    </div>
  );
};

export default FormLoading;
