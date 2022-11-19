import { EPSILON, Gramatica, Simbolo } from './gramatica.model';

export const gramaticaRAFA = new Gramatica();
// gramaticaRAFA.raiz = '<E>';
// gramaticaRAFA.regras.push(new Simbolo('<E>', [['<T>', "<E'>"]]));
// gramaticaRAFA.regras.push(
//   new Simbolo("<E'>", [['+', '<T>', "<E'>"], [EPSILON]])
// );
// gramaticaRAFA.regras.push(new Simbolo('<T>', [['<F>', "<T'>"]]));
// gramaticaRAFA.regras.push(
//   new Simbolo("<T'>", [['*', '<F>', "<T'>"], [EPSILON]])
// );
// gramaticaRAFA.regras.push(new Simbolo('<F>', [['(', '<E>', ')'], ['id']]));

gramaticaRAFA.raiz = '<S>';
gramaticaRAFA.regras.push(new Simbolo('<S>', [['<A>'], ['<B>']]));
gramaticaRAFA.regras.push(
  new Simbolo('<A>', [
    ['a', '<A>', '<S>'],
    ['<B>', '<D>'],
  ])
);
gramaticaRAFA.regras.push(
  new Simbolo('<B>', [['b', '<B>'], ['f', '<A>', '<C>'], [EPSILON]])
);
gramaticaRAFA.regras.push(
  new Simbolo('<C>', [
    ['c', '<C>'],
    ['<B>', '<D>'],
  ])
);
gramaticaRAFA.regras.push(
  new Simbolo('<D>', [['g', '<D>'], ['<C>'], [EPSILON]])
);
