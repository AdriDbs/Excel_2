export interface Function {
  name: string;
  description: string;
  example?: string;
}

export interface UseCase {
  id: number;
  title: string;
  category: string;
  description: string;
  functions: Function[];
  benefits: string[];
  implementation: string;
  example: string;
  exampleSource: string;
  related?: string;
}
