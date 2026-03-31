import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Upload from '../Upload.jsx';
import { MemoryRouter } from 'react-router-dom';

expect.extend(toHaveNoViolations);

test('Upload hat keine offensichtlichen a11y-Violations', async () => {
  const { container } = render(
    <MemoryRouter>
      <Upload />
    </MemoryRouter>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
