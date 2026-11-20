import React from 'react';
import { TestCaseModal, TestCaseModalProps } from './TestCaseModal';

export const AddTestCaseModal: React.FC<TestCaseModalProps> = (props) => {
  return <TestCaseModal {...props} />;
};

export { TestCaseModal };
