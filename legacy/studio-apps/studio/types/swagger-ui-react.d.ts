declare module 'swagger-ui-react' {
  import type { ComponentType } from 'react';
  interface SwaggerUIProps {
    url?: string;
    spec?: object;
  }
  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
