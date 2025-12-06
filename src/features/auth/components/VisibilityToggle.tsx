'use client';

import { useState } from 'react';

import { EyeIcon } from '@/components/icons/EyeIcon';
import { EyeSlashIcon } from '@/components/icons/EyeSlashIcon';

type TVisibilityToggleProps = {
  onClick: () => void;
};

const VisibilityToggle = ({ onClick }: TVisibilityToggleProps) => {
  const [visible, setVisible] = useState(false);

  const handleClick = () => {
    setVisible((prev) => !prev);
    onClick();
  };

  return (
    <div onClick={handleClick}>{visible ? <EyeSlashIcon /> : <EyeIcon />}</div>
  );
};

export default VisibilityToggle;
