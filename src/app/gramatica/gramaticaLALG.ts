import { EPSILON, Gramatica, Simbolo } from './gramatica.model';

export const gramaticaLALG = new Gramatica();
gramaticaLALG.raiz = '<programa>';
gramaticaLALG.regras = [];
gramaticaLALG.regras.push(
  new Simbolo('<programa>', [['program', '<identificador>', ';', '<bloco>']])
);

gramaticaLALG.regras.push(
  new Simbolo('<bloco>', [
    [
      '<parte de declarações de variáveis>' /*,"<parte de declarações de sub-rotinas>","<comando composto>"*/,
    ],
  ])
);

gramaticaLALG.regras.push(
  new Simbolo('<parte de declarações de variáveis>', [
    ['<declaração de variáveis>', "<parte de declarações de variáveis'>", ';'],
    [EPSILON],
  ])
);
gramaticaLALG.regras.push(
  new Simbolo("<parte de declarações de variáveis'>", [
    [';', '<declaração de variáveis>', "<parte de declarações de variáveis'>"],
    [EPSILON],
  ])
);

gramaticaLALG.regras.push(
  new Simbolo('<declaração de variáveis>', [
    ['<tipo>', '<lista de identificadores>'],
  ])
);

gramaticaLALG.regras.push(
  new Simbolo('<lista de identificadores>', [
    ['<identificador>', "<lista de identificadores'>"],
  ])
);
gramaticaLALG.regras.push(
  new Simbolo("<lista de identificadores'>", [
    [',', '<identificador>', "<lista de identificadores'>"],
    [EPSILON],
  ])
);

// gramaticaLALG.regras.push(new Simbolo("<parte de declarações de subrotinas>", [["<declaração de procedimento>",";"],[EPSILON]]));

// gramaticaLALG.regras.push(new Simbolo("<declaração de procedimento>", [["procedure","<identificador>","<parâmetros formais>",";","<bloco>"],["procedure","<identificador>",";","<bloco>"]]));

// gramaticaLALG.regras.push(new Simbolo("<parâmetros formais>", [["(","<seção de parâmetros formais>",")"],[";","<seção de parâmetros formais>"]]));

// gramaticaLALG.regras.push(new Simbolo("<seção de parâmetros formais>", [["var","<lista de identificadores>",":","<identificador>"],["<lista de identificadores>",":","<identificador>"]]));

gramaticaLALG.regras.push(new Simbolo('<tipo>', [['int'], ['boolean']]));

// gramaticaLALG.regras.push(new Simbolo('<número>', [['<dígito>']]));

gramaticaLALG.regras.push(
  new Simbolo('<dígito>', [
    ['0'],
    ['1'],
    ['2'],
    ['3'],
    ['4'],
    ['5'],
    ['6'],
    ['7'],
    ['8'],
    ['9'],
  ])
);

gramaticaLALG.regras.push(
  new Simbolo('<identificador>', [['<letra>', "<identificador'>"]])
);
gramaticaLALG.regras.push(
  new Simbolo("<identificador'>", [
    ['<letra>', "<identificador'>"],
    ['<dígito>', "<identificador'>"],
  ])
);

gramaticaLALG.regras.push(
  new Simbolo('<letra>', [
    ['_'],
    ['a'],
    ['b'],
    ['c'],
    ['d'],
    ['e'],
    ['f'],
    ['g'],
    ['h'],
    ['i'],
    ['j'],
    ['k'],
    ['l'],
    ['m'],
    ['n'],
    ['o'],
    ['p'],
    ['q'],
    ['r'],
    ['s'],
    ['t'],
    ['u'],
    ['v'],
    ['w'],
    ['x'],
    ['y'],
    ['z'],
    ['A'],
    ['B'],
    ['C'],
    ['D'],
    ['E'],
    ['F'],
    ['G'],
    ['H'],
    ['I'],
    ['J'],
    ['K'],
    ['L'],
    ['M'],
    ['N'],
    ['O'],
    ['P'],
    ['Q'],
    ['R'],
    ['S'],
    ['T'],
    ['U'],
    ['V'],
    ['W'],
    ['X'],
    ['Y'],
    ['Z'],
  ])
);
