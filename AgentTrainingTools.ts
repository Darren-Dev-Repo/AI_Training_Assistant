export const myTools: Record<string, Function> = {
    addWeight: (args: any) => {
        console.log(`\n[系統後台] 執行加重計算：${args.currentWeightKg} + ${args.minWeightChangeInKg}`);
        return { nextWeight: args.currentWeightKg + args.minWeightChangeInKg };
    },
    deload: (args: any) => {
        console.log(`\n[系統後台] 執行降重計算：${args.currentWeightKg} * ${args.deloadPercentage}`);
        let rawWeight = args.currentWeightKg * args.deloadPercentage;
        let finalWeight = Math.floor(rawWeight / args.minWeightChangeInKg) * args.minWeightChangeInKg;
        return { nextWeight: finalWeight };
    },
    getNextWorkoutType: (args: any) => {
        const currentIndex = args.dayTag.indexOf(args.currentWorkoutType);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % args.dayTag.length;
        console.log(`\n[系統後台] 計算下次訓練日：切換為 ${args.dayTag[nextIndex]}`);
        return { nextDay: args.dayTag[nextIndex] };
    }
};