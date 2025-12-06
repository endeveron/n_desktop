'use client';

import { AcceptIcon } from '@/components/icons/AcceptIcon';
import { DeclineIcon } from '@/components/icons/DeclineIcon';
import Loading from '@/components/shared/Loading';

interface TaskbarPromptProps {
  loading: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TaskbarPrompt = ({
  loading,
  onAccept,
  onDecline,
}: TaskbarPromptProps) => {
  return (
    <div className="flex-center mx-auto">
      {loading ? (
        <div className="scale-75 mx-1">
          <Loading />
        </div>
      ) : (
        <div className="flex items-center gap-4 ml-1">
          <AcceptIcon onClick={onAccept} className="icon--action" />
          <DeclineIcon onClick={onDecline} className="icon--action" />
        </div>
      )}
    </div>
  );
};

export default TaskbarPrompt;
