export class Simbolo{
    nome: string;
    deriv: string[][];
    constructor(nome:string, deriv:string[][], isTerm:boolean){
        this.nome = nome;
        this.deriv = deriv;
    }
}

export class Gramatica{
    raiz: string;
    regras: Simbolo[];
}

const gramaticaLALG = new Gramatica();
gramaticaLALG.raiz = "<programa>";
gramaticaLALG.regras = []
gramaticaLALG.regras.push(new Simbolo("<programa>", [["program", "<identificador>", ';', "<bloco>"]],false));

gramaticaLALG.regras.push(new Simbolo("<bloco>", [["<parte de declarações de variáveis>","<parte de declarações de sub-rotinas>","<comando composto>"]],false));

gramaticaLALG.regras.push(new Simbolo("<parte de declarações de variáveis>", [["<declaração de variáveis>",";"],['ε']],false));

gramaticaLALG.regras.push(new Simbolo("<declaração de variáveis>", [["<tipo>","<lista de identificadores>"]],false));

gramaticaLALG.regras.push(new Simbolo("<lista de identificadores>", [["<identificador>"],[",","<identificador>"]],false));

gramaticaLALG.regras.push(new Simbolo("<parte de declarações de subrotinas>", [["declaração de procedimento>",";"],['ε']],false));

gramaticaLALG.regras.push(new Simbolo("<declaração de procedimento>", [["procedure","<identificador>","<parâmetros formais>",";","<bloco>"]],false));

gramaticaLALG.regras.push(new Simbolo("<parâmetros formais>", [[]],false));

gramaticaLALG.regras.push(new Simbolo("<seção de parâmetros formais>", [[]],false));

