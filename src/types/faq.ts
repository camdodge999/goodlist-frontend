export type FAQ = {
    id: string;
    question: {
      th: string;
    };
    answer: {
      th: string;
    };
    category: 'account' | 'policy' | 'security' | 'cookies' | 'general';
  };
  