from unscroll import UnscrollClient

c = UnscrollClient()
p = c.cache_thumbnail('https://upload.wikimedia.org/wikipedia/commons/b/b2/Donnchadh_mac_Gille-Brighdhe_Seal.jpg')
print(p)
