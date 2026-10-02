export const sampleResults = {
    plan: { style: "sip", amount: 5000, from: "2019-09-11", to: "2026-08-19" },
    invested: 415000,
    mix: {
        finalValue: 802400,
        annualReturn: 0.184,
        risk: 0.138,
        worstFall: 0.246,
        beta: 0.82
    },
    benchmark: {
        finalValue: 738100,
        annualReturn: 0.162,
        risk: 0.161,
        worstFall: 0.383
    },

    // Careful: share is a WHOLE number, 25 means 25%. In the real results it comes straight
    // from the boxes the user typed in Card 1, which are whole numbers adding up to 100.
    // Every other percentage here (annualReturn, risk, worstFall, and the mix and benchmark
    // numbers above) is a FRACTION, 0.264 means 26.4%, because that is what the maths engine
    // gives back. So show a share by adding the "%" sign yourself, and show the fractions with
    // formatPercent. Passing a share to formatPercent would multiply it by 100 and show 2500%.
    funds: [
        { schemeCode: 118778, shortName: "Nippon India Small Cap", share: 25, annualReturn: 0.264, risk: 0.198, worstFall: 0.342 },
        { schemeCode: 118989, shortName: "HDFC Mid Cap", share: 15, annualReturn: 0.221, risk: 0.176, worstFall: 0.318 },
        { schemeCode: 118632, shortName: "Nippon India Large Cap", share: 25, annualReturn: 0.173, risk: 0.162, worstFall: 0.389 },
        { schemeCode: 119028, shortName: "DSP Natural Resources", share: 10, annualReturn: 0.198, risk: 0.224, worstFall: 0.413 },
        { schemeCode: 119099, shortName: "DSP Gilt", share: 15, annualReturn: 0.071, risk: 0.036, worstFall: 0.052 },
        { schemeCode: 140088, shortName: "Gold BeES", share: 10, annualReturn: 0.149, risk: 0.131, worstFall: 0.187 }
    ]
};