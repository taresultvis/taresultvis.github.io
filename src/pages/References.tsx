import React, { useEffect, useState } from 'react';

interface Paper {
  Index: string;
  Title: string;
  URL: string;
  Year: string;
}

const References: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch('/paperInfo.tsv');
        const text = await response.text();
        
        // Manual TSV parsing to avoid d3.tsvParse quote handling issues
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split('\t');
        const data = lines.slice(1).map(line => {
          const values = line.split('\t');
          const obj: Record<string, string> = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] || "";
          });
          return obj;
        });

        setPapers(data as unknown as Paper[]);
      } catch (error) {
        console.error('Error fetching paperInfo.tsv:', error);
      }
    };

    fetchPapers();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-2">References</h1>
      <p className="text-gray-600 mb-6">List of papers analyzed in this study.</p>
      
      <div className="flex grow overflow-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                Index
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                Year
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {papers.map((paper, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">
                  {paper.Index}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {paper.Title}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <a 
                    href={paper.URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 break-all"
                  >
                    {paper.URL}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {paper.Year}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default References;
