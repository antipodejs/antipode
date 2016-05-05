import VDataRepeater from '../components/VDataRepeater';
import collection from '../components/Collection'; 


let c = new collection(), a = [];

for (let i = 0, cnt = 100; i < cnt; ++i) {
	a[a.length] = {name: i + ' item'};	
};

c.initial(a);

class VDataRepeaterTEST extends VDataRepeater {
	setExtend () {
		super.setExtend();
		console.log('print 1 ')
	}

	doIt () {
		super.doIt();
		console.log('Doit was make');
	}
};

let vdr = new VDataRepeaterTEST({
	collection: c

});

vdr.observe('first', (is, was) => {
	console.log('CHANGE first ', is, was);
});


console.log('TEST vdr = ', vdr);  
