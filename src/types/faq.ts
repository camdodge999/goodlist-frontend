export type FAQ = {
    id: string;
    question: {
      en: string;
      th: string;
    };
    answer: {
      en: string;
      th: string;
    };
    category: 'account' | 'policy' | 'security' | 'cookies' | 'general';
  };
  