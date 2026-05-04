interface ITrainingTools {
    addWeight(currentWeightKg: number, minWeightChangeInKg: number): number;
    getNextWorkoutType(currentWorkoutType: string, dayTag: string[]): string;
    deload(currentWeightKg: number, minWeightChangeInKg: number, deloadPercentage: number): number;
}

class AgentTrainingTools implements ITrainingTools {
    addWeight(currentWeightKg: number, minWeightChangeInKg: number): number {
        return currentWeightKg + minWeightChangeInKg;
    }

    getNextWorkoutType(currentWorkoutType: string, dayTag: string[]): string {
        const currentIndex: number = dayTag.indexOf(currentWorkoutType);

        /* 防呆機制：如果傳入一個不在陣列裡的字串
           我們就強迫訓練者從第一天開始練 */
        if (currentIndex === -1) {
            return dayTag[0] || "A";
        }

        const nextIndex = (currentIndex + 1) % dayTag.length;
        return dayTag[nextIndex] || "A";
    }

    deload(currentWeightKg: number, minWeightChangeInKg: number, deloadPercentage: number): number {
        let rawWeight: number = currentWeightKg * deloadPercentage;
        // Make the final weight be a multiple of the weight of the lightest plate in the gym 
        return Math.floor(rawWeight / minWeightChangeInKg) * minWeightChangeInKg;
    }

}