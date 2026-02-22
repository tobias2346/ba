
export type RowDetail = {
  id: number;
  label: string;
  seatsCount: number;
};

export type Sector = {
  id: number;
  name: string;
  rows: RowDetail[];
}

export type StandOrientation = 'N' | 'S' | 'E' | 'O';
export type StandType = '1_bandeja' | '2_bandeja' | '3_bandeja' | 'codo_norte' | 'codo_sur';

export type StandDetail = {
  id: number;
  name: string;
  orientation: StandOrientation | null;
  type: StandType | null;
  sectors: Sector[];
};
