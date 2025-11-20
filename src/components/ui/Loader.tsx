import React from 'react';
import { LoaderCircle } from 'lucide-react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Loader;
