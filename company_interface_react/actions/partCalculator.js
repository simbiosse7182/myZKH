
// Считает наименьшее общее кратное
function _nok( numbers ){

    let a = Math.abs( numbers[0] );

    numbers.map( number => {
        let b = Math.abs(number),
            c = a;

        while (a && b){ a > b ? a %= b : b %= a; }

        a = Math.abs( c * number )/(a + b);
    });
    return a;
}

// Считает сумму дробей из двух массивов. numerators / denominators
export function partSummCalculator( numerators, denominators ){

    if( numerators.length === 0 || denominators.length === 0 ) return 0;
    let nok = _nok( denominators ),
        summ = parseInt( numerators.map( ( number, index ) => number * (nok/ denominators[index])).reduce( ( sum, el ) => sum += +el ) ) / parseInt(nok);

    return summ;
}

// Считает сумму дробей из массивов [ num/denum], [num/denum]
export function partCalculator( numbers ){

    let numerators = [],
        denominators = [];

    numbers.map( number => {
        if( +number[0] && +number[0] > 0 && +number[1] && +number[1] > 0 ){
            numerators.push( number[0] );
            denominators.push( number[1] );
        }
    })

    return partSummCalculator( numerators, denominators );
}
