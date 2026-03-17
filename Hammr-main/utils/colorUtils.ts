import { JobStatus, PaymentStatus, VerificationStatus } from '../types';

export const getJobStatusColor = (status: JobStatus): 'green' | 'yellow' | 'blue' | 'red' => {
  switch (status) {
    case JobStatus.Completed:
      return 'green';
    case JobStatus.Active:
      return 'blue';
    case JobStatus.Pending:
      return 'yellow';
    case JobStatus.Cancelled:
      return 'red';
    default:
      return 'yellow';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus): 'green' | 'yellow' | 'blue' | 'red' | 'gray' => {
      switch (status) {
        case PaymentStatus.Released:
          return 'green';
        case PaymentStatus.InEscrow:
          return 'blue';
        case PaymentStatus.PendingDeposit:
          return 'yellow';
        case PaymentStatus.Disputed:
          return 'red';
        case PaymentStatus.Refunded:
          return 'gray';
        default:
          return 'yellow';
      }
    };

export const getVerificationStatusColor = (status: VerificationStatus): 'green' | 'yellow' | 'red' => {
    switch(status) {
        case VerificationStatus.Approved:
            return 'green';
        case VerificationStatus.Pending:
            return 'yellow';
        case VerificationStatus.Rejected:
            return 'red';
        default:
            return 'yellow';
    }
}