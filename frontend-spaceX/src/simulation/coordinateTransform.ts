export class CoordinateTransform {
    static quaternionToRotationMatrix(q: [number, number, number, number]): number[][] {
        const [q0, q1, q2, q3] = q;
        const q0q0 = q0*q0;
        const q1q1 = q1*q1;
        const q2q2 = q2*q2;
        const q3q3 = q3*q3;

        return [
            [q0q0+q1q1-q2q2-q3q3, 2*(q1*q2+q0*q3),       2*(q1*q3 - q0*q2)],
            [2*(q1*q2 - q0*q3),   q0q0 - q1q1+q2q2-q3q3, 2*(q2*q3+q0*q1)],
            [2*(q1*q3+q0*q2),     2*(q2*q3 - q0*q1),     q0q0 - q1q1 - q2q2+q3q3]
        ];
    }

    static bodyToEarth(q: [number, number, number, number], vecBody: [number, number, number]): [number, number, number] {
        const R = this.quaternionToRotationMatrix(q);
        return [
            R[0][0]*vecBody[0] + R[0][1]*vecBody[1] + R[0][2]*vecBody[2],
            R[1][0]*vecBody[0] + R[1][1]*vecBody[1] + R[1][2]*vecBody[2],
            R[2][0]*vecBody[0] + R[2][1]*vecBody[1] + R[2][2]*vecBody[2],
        ];
    }

    static earthToBody(q: [number, number, number, number], vecEarth: [number, number, number]): [number, number, number] {
        // Body->Earthの逆はEarth->Bodyなので、qの共役で回すか、転置行列を用いる
        const [q0, q1, q2, q3] = q;
        const qc: [number, number, number, number] = [q0, -q1, -q2, -q3];
        return this.bodyToEarth(qc, vecEarth);
    }
}
