/**
 * Generates an SVG path for a wavy line
 * @param width - The width of the wave
 * @param amplitude - The height of the wave peaks (default: 3)
 * @param frequency - How frequent the waves are (default: 0.1)
 * @returns SVG path string
 */
export const generateWavePath = (
    width: number,
    amplitude: number = 3,
    frequency: number = 0.1
): string => {
    const waveHeight = amplitude * 2;
    let path = `M 0 ${amplitude}`;

    // Generate wave points
    for (let x = 0; x <= width; x++) {
        const y = amplitude + amplitude * Math.sin(x * frequency);
        path += ` L ${x} ${y}`;
    }

    // Close the path to create a filled area
    path += ` L ${width} ${waveHeight}`;
    path += ` L 0 ${waveHeight}`;
    path += ` Z`;

    return path;
};
