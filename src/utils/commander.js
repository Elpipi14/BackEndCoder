import { Command } from "commander";
const program = new Command();

// 1er comando, 2do descripcion, 3ero valor por default:
program
    .option("--mode <mode>", "mode job", "production");
program.parse();

export default program;