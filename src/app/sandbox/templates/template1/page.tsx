import exampleData from '@/components/page-templates/example-page-data.json';
import Template1 from '@/components/page-templates/PageTemplate1';

export default function Page() {
  return <Template1 content={exampleData} />;
}
