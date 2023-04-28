let instruments = {
    synth:
    {
        triangle: () => getInstrument("synth", "triangle"),
        square: () => getInstrument("synth", "square")
    },
    sampler:
    {
        default: () => getInstrument("sampler")
    }
}

function getInstrument(voiceType, type)
{
    let options = {};

    switch (voiceType)
    {
        case "synth":
            switch (type)
            {
                case "triangle":
                    options.oscilator = new Tone.Oscillator(440, "triangle");
                break;
                case "square":
                    options.oscilator = new Tone.Oscillator(440, "square");
                break;
            }

            return new Tone.PolySynth(Tone.Synth, options).toDestination();

        break;
        case "sampler":
            
            options = {
                urls: {
                    A1: "A1.mp3",
                    A2: "A2.mp3",
                },
                baseUrl: "./Instruments/Test1/"
            };

            return new Tone.Sampler(options).toDestination();
        break;
    }
}

