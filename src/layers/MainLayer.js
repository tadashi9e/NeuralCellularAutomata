class MainLayer {

    constructor() {
        this.initiate();
    }

    initiate() {
        this.populateCellGrid();
        this.generateUpdateAndDrawKernels();
    }

    update(cycle) {
        let cellTexture = this.updateCellMatrix(columnNumber, rowNumber, this.cells, kernel);
        if (this.cells.delete) this.cells.delete();
        this.phase[cycle] = cellTexture;
        this.cells = cellTexture;
    }

    draw() {
        this.paintCells(
            this.phase[0],
            this.phase[1],
            this.phase[2],
            this.phase[3]);
    }

    populateCellGrid() {
        this.cells = [];
        for (let i = 0; i < rowNumber; i++) {
            this.cells[i] = []
            for (let j = 0; j < columnNumber; j++)
                this.cells[i].push(Math.random() > 0.5 ? 1 : 0);
        }
        this.phase = [];
        for (let i = 0; i < 4; i++) {
            this.phase.push(this.cells);
        }
    }

    generateUpdateAndDrawKernels() {
        this.gpu = new GPUX({ canvas, context: gl });

        this.gpu.addFunction(activation);

        this.updateCellMatrix = this.gpu.createKernel(function(columnNumber, rowNumber, cellMatrix, kernelValues) {
            let x = Math.floor(this.thread.x), y = Math.floor(this.thread.y);
            let yMinusOne = y == 0 ? rowNumber-1 : y-1;
            let yPlusOne = y == rowNumber-1 ? 0 : y+1;
            let xMinusOne = x == 0 ? columnNumber-1 : x-1;
            let xPlusOne = x == columnNumber-1 ? 0 : x+1;

            let updatedValue = cellMatrix[y][x]*kernelValues[1][1]
                        + cellMatrix[yMinusOne][x] * kernelValues[0][1]
                        + cellMatrix[y][xMinusOne] * kernelValues[1][0]
                        + cellMatrix[yMinusOne][xMinusOne] * kernelValues[0][0]
                        + cellMatrix[yPlusOne][x] * kernelValues[2][1]
                        + cellMatrix[y][xPlusOne] * kernelValues[1][2]
                        + cellMatrix[yPlusOne][xPlusOne] * kernelValues[2][2]
                        + cellMatrix[yMinusOne][xPlusOne] * kernelValues[0][2]
                        + cellMatrix[yPlusOne][xMinusOne] * kernelValues[2][0];
            return 0.0+activation(updatedValue);
        }, { immutable: true })
        .setOutput([columnNumber, rowNumber])
        .setPipeline(true);

        this.paintCells = this.gpu.createKernel(
            function(phase0, phase1, phase2, phase3) {
                let p0 = phase0[this.thread.y][this.thread.x];
                let p1 = phase1[this.thread.y][this.thread.x];
                let p2 = phase2[this.thread.y][this.thread.x];
                let p3 = phase3[this.thread.y][this.thread.x];
                let g = (p0 * p1 + p1 * p2 + p2 * p3 + p3 * p0) / 4.0;
                // let g = (p0 + p1 + p2 + p3) / 4.0;
                let r = (p0 + p2) / 2.0;
                let b = (p1 + p3) / 2.0;
                let green = (g <= 0.0 ? 0.0 :
                             g >= 1.0 ? 1.0 :
                             g);
                let red = (r <= 0.0 ? 0.0 :
                           r >= 1.0 ? 1.0 :
                           r);
                let blue = (b <= 0.0 ? 0.0 :
                            b >= 1.0 ? 1.0 :
                            b);
                this.color(red, green, blue, 1);
            }).setOutput([columnNumber, rowNumber])
            .setGraphical(true);
    }
}

