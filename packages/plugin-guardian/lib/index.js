import {forEach, merge, values} from 'lodash/fp';

import searchPlugin from './search';

const plugins = {
  guardian_search: searchPlugin,
};

forEach(p => {
  p.argv = merge({  // eslint-disable-line no-param-reassign
    'guardian.key': {
      type: 'string',
      desc: 'An API key for authentication.',
    },
  }, p.argv);
}, values(plugins));

export { plugins };
export default { plugins };
