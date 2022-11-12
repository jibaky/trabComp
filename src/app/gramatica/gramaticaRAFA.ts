import { EPSILON, Gramatica, Simbolo } from './gramatica.model';

export const gramaticaRAFA = new Gramatica();
gramaticaRAFA.raiz = '<E>';
gramaticaRAFA.regras.push(new Simbolo('<E>', [['<T>', "<E'>"]]));
gramaticaRAFA.regras.push(
  new Simbolo("<E'>", [['+', '<T>', "<E'>"], [EPSILON]])
);
gramaticaRAFA.regras.push(new Simbolo('<T>', [['<F>', "<T'>"]]));
gramaticaRAFA.regras.push(
  new Simbolo("<T'>", [['*', '<F>', "<T'>"], [EPSILON]])
);
gramaticaRAFA.regras.push(new Simbolo('<F>', [['(', '<E>', ')'], ['id']]));
