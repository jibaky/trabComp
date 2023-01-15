import { EPSILON, Gramatica, Simbolo } from './gramatica.model';

export const gramaticaLALG = new Gramatica();
gramaticaLALG.raiz = '<programa>';
gramaticaLALG.regras = [];

gramaticaLALG.regras.push( // 1
  new Simbolo('<programa>', [ 
    [
      'program', '<identificador>', ';', '<bloco>'
    ]
  ])
);

gramaticaLALG.regras.push( // 2
  new Simbolo('<bloco>', [
    [
      '<parte de declarações de variáveis>' ,"<parte de declarações de sub-rotinas>","<comando composto>"
    ],
  ])
);

gramaticaLALG.regras.push( // 3
  new Simbolo('<parte de declarações de variáveis>', [
    [
      '<declaração de variáveis>', "<parte de declarações de variáveis'>", ';'
    ],
    [EPSILON],
  ])
);
gramaticaLALG.regras.push( // 3'
  new Simbolo("<parte de declarações de variáveis'>", [
    [
      ';', '<declaração de variáveis>', "<parte de declarações de variáveis'>"
    ],
    [EPSILON],
  ])
);

gramaticaLALG.regras.push( // 4
  new Simbolo('<declaração de variáveis>', [
    [
      '<tipo>', '<lista de identificadores>'
    ],
  ])
);

gramaticaLALG.regras.push( // 5
  new Simbolo('<lista de identificadores>', [
    [
      '<identificador>', "<lista de identificadores'>"
    ],
  ])
);
gramaticaLALG.regras.push( // 5'
  new Simbolo("<lista de identificadores'>", [
    [
      ',', '<identificador>', "<lista de identificadores'>"
    ],
    [EPSILON],
  ])
);

gramaticaLALG.regras.push( // 6
  new Simbolo("<parte de declarações de subrotinas>", [
    [
      "<declaração de procedimento>",";","<parte de declarações de subrotinas'>"
    ],
    [EPSILON]
  ])
);

  gramaticaLALG.regras.push( // 6'
  new Simbolo("<parte de declarações de subrotinas'>", [
    [
      "<declaração de procedimento>",";","<parte de declarações de subrotinas'>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 7
  new Simbolo("<declaração de procedimento>", [
    [
      "procedure","<identificador>","<parâmetros formais>",";","<bloco>"
    ],
  ])
);

gramaticaLALG.regras.push( // 8
  new Simbolo("<parâmetros formais>", [
    [
      "(","<seção de parâmetros formais>","<parâmetros formais'>",")"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 8'
  new Simbolo("<parâmetros formais'>", [
    [
      ";","<seção de parâmetros formais>","<parâmetros formais'>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 9
  new Simbolo("<seção de parâmetros formais>", [
    [
      "<seção de parâmetros formais'>","<lista de identificadores>",":","<identificador>"
    ]
  ])
);

gramaticaLALG.regras.push( // 9'
  new Simbolo("<seção de parâmetros formais'>", [
    [
      "var"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 10
  new Simbolo("<comando composto>", [
    [
      "begin","<comando>","<comando composto'>","end"
    ],
  ])
);

gramaticaLALG.regras.push( // 10'
  new Simbolo("<comando composto'>", [
    [
      ";","comando"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 11
  new Simbolo("<comando>", [
    ["<atribuição>"],
    ["<chamada de procedimento>"],
    ["<comando composto>"],
    ["<comando condicional 1>"],
    ["<comando repetitivo 1>"],
  ])
);

gramaticaLALG.regras.push( // 12
  new Simbolo("<atribuição>", [
    [
      "<variável>",":=","<expressão>"
    ],
  ])
);

gramaticaLALG.regras.push( // 13
  new Simbolo("<chamada de procedimento>", [
    [
      "<identificador>","<chamada de procedimento'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 13'
  new Simbolo("<chamada de procedimento'>", [
    [
      "(","<lista de expressões>",")"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 14
  new Simbolo("<comando condicional 1>", [
    [
      "if","<expressão>","then","<comando>","<comando condicional 1'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 14'
  new Simbolo("<comando condicional 1'>", [
    [
      "else","<comando>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 15
  new Simbolo("<comando repetitivo 1>", [
    [
      "while","<expressão>","do","<comando>"
    ],
  ])
);

gramaticaLALG.regras.push( // 16
  new Simbolo("<expressão>", [
    [
      "<expressão simples>","<expressão'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 16'
  new Simbolo("<expressão'>", [
    [
      "<relação>","<expressão simples>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 17
  new Simbolo("<relação>", [
    ["="],
    ["<>"],
    ["<"],
    ["<="],
    [">="],
    [">"]
  ])
);

gramaticaLALG.regras.push( // 18
  new Simbolo("<expressão simples>", [
    [
      "<expressão simples'>","<termo>","<expressão simples''>"
    ],
  ])
);

gramaticaLALG.regras.push( // 18'
  new Simbolo("<expressão simples'>", [
    ["+"],
    ["-"]
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 18''
  new Simbolo("<expressão simples''>", [
    [
      "(","<expressão simples'''>","<termo>","<expressão simples''>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 18'''
  new Simbolo("<expressão simples'''>", [
    ["+"],
    ["-"],
    ["or"]
  ])
);

gramaticaLALG.regras.push( // 19
  new Simbolo("<termo>", [
    [
      "<fator>","<termo'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 19'
  new Simbolo("<termo'>", [
    [
      "(","<termo''>",")","<fator>","<termo'>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 19''
  new Simbolo("<termo''>", [
    ["*"],
    ["div"],
    ["and"]
  ])
);

gramaticaLALG.regras.push( // 20
  new Simbolo("<fator>", [
    ["<variável>"],
    ["<número>"],
    ["(","<expressão>",")"],
    ["not", "<fator>"],
  ])
);

gramaticaLALG.regras.push( // 21
  new Simbolo("<variável>", [
    [
      "<identificador>","<variável'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 21'
  new Simbolo("<variável'>", [
    [
      "[","expressão","]"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 22
  new Simbolo("<lista de expressões>", [
    [
      "<expressão>","<lista de expressões'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 22'
  new Simbolo("<lista de expressões'>", [
    [
      ",","expressão","lista de expressões'"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 23
  new Simbolo('<número>', [
    [
      '<dígito>',"<número'>"
    ]
  ])
);

gramaticaLALG.regras.push( // 23'
  new Simbolo("<número'>", [
    [
      '<dígito>',"<número'>"
    ],
    [EPSILON]
  ])
);

gramaticaLALG.regras.push( // 24
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

gramaticaLALG.regras.push( // 25
  new Simbolo('<identificador>', [
    [
      '<letra>', "<identificador'>"
    ]
  ])
);
gramaticaLALG.regras.push( // 25'
  new Simbolo("<identificador'>", [
    [
      '<letra>', "<identificador'>"
    ],
    [
      '<dígito>', "<identificador'>"
    ],
  ])
);

gramaticaLALG.regras.push( // 26
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
    ['Z']
  ])
);

gramaticaLALG.regras.push(
  new Simbolo('<tipo>', [
    [
      'int'
    ],
    [
      'boolean'
    ]
  ])
);
